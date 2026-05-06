import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ResendEmailService } from "../resend-email/resendEmail.service";
import { ProjectRole } from "../../../generated/prisma/enums";
import { inviteTemplate } from "../resend-email/html/invite";
import { BadRequestError } from "openai";

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private resendEmailService :ResendEmailService,
  ) {}

  async inviteUser(projectId: string, email: string, userId: string, role: ProjectRole) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const user =await this.prisma.user.findUnique({
    where:{
        email:email
    },
  })

  await this.prisma.projectInvite.upsert({
    where: {
      projectId_email: { projectId, email },
    },
    update: {
      role,
      invitedById: userId,
      expiresAt,
      status: "PENDING",
      invitedUserId:user?.id
    },
    create: {
      email,
      projectId,
      invitedById: userId,
      role,
      expiresAt,
      status :"PENDING",
      invitedUserId:user?.id
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/invites`;
  const html = inviteTemplate(inviteLink, email);

  await this.resendEmailService.sendEmail({
    to: [email],
    subject: "Invite to join project",
    html,
  });
}

async getInviteData (inviteId:string ,userId:string){
    return await this.prisma.projectInvite.findFirstOrThrow({
        where:{id:inviteId , invitedUserId:userId},
        include:{
            project:{
                select:{
                    description:true,
                    name:true,

                }
            }
        }
    });
}

async rejectInvite(inviteId:string ,userId:string){
    await this.prisma.projectInvite.update({
        where:{id:inviteId ,invitedUserId:userId},
        data:{
            status:'REJECTED'
        }
    });
}

async acceptInvite(inviteId:string ,userId:string){
    const projectInvite = await this.prisma.projectInvite.update({
        where:{id:inviteId , invitedUserId:userId},
        data:{
            status:'ACCEPTED'
        }
    });

    const user = await this.prisma.user.findFirstOrThrow({
        where:{
            email:projectInvite.email
        }
    })

    await this.prisma.projectMember.create({
        data:{
            projectId:projectInvite.projectId,
            userId:user.id,
            role:projectInvite.role
        }
    })
}

async getInvites(userId:string){
    return await this.prisma.projectInvite.findMany({
        where:{
            invitedUserId:userId,
            status:{not:"REJECTED"}
        },
        include:{
            project:{
                select:{
                    description:true,
                    name:true,

                }
            },
            invitedBy:{
                select:{
                    name:true,
                }
            }
        }
    });
}

async getProjectInvitedUsersAndOwner(projectId:string){
    const [invitedUser , owner] =await Promise.all([ this.prisma.projectInvite.findMany({
        where:{
            projectId
        },
        include:{
            invitedUser:{
                select:{
                    name:true, 
                }
            }
        },
        orderBy:{email:'asc'}
    }),
    this.prisma.project.findUniqueOrThrow({
        where:{
            id:projectId
        },
        select:{
            user:{
                select:{
                    email:true,
                    name:true
                }
            }
        }
    })
]);

return [{role:'admin', isOwner:true, name :owner.user.name , email:owner.user.email , id:"owner-id"}, ...invitedUser.map((iu)=>{
    return {
        ...iu,
        invitedUser:undefined,
        name:iu.invitedUser?.name,
    }
})]
}

async cancelInvite(inviteId:string ,userId:string){
    await this.prisma.projectInvite.delete({
        where:{id:inviteId ,invitedUserId:userId}
    });
}

async removeUserFromProject(inviteId:string , projectId:string ,adminId:string ){
    const [project, invite] = await Promise.all([this.prisma.project.findUniqueOrThrow({
            where:{id:projectId},
            select:{
            userId:true,
            }
        }),
        this.prisma.projectInvite.findUniqueOrThrow({
                where:{id:inviteId},
                select:{
                invitedUserId:true
                }
            })]) ;
    if(project?.userId === invite.invitedUserId){
        throw new BadRequestException('Owner can not be removed!')
    }
    if(invite.invitedUserId === adminId){
        throw new BadRequestException("Can not remove self user!")
    }

    await this.prisma.$transaction(async (prisma)=>{
        await Promise.all([
            prisma.projectInvite.delete({
                where:{id:inviteId,projectId :projectId}
            }),
            invite.invitedUserId && prisma.projectMember.deleteMany({
                where:{
                      projectId ,userId : invite.invitedUserId
                }
            })
        ])

    })
}

async leaveProject(projectId:string , userId:string){
const project = await this.prisma.project.findUniqueOrThrow({
        where:{id:projectId},
        select:{
           userId:true,
        }
    });
    if(project?.userId === userId){
        throw new BadRequestException('Owner can not leave project!')
    }
    await this.prisma.$transaction(async (prisma)=>{
        await Promise.all([
            prisma.projectInvite.deleteMany({
        where:{invitedUserId:userId ,projectId :projectId}
    }),
    prisma.projectMember.delete({
        where:{
            projectId_userId:{userId , projectId}
        }
    })
        ])

    })
}
}