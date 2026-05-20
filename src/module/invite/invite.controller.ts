import { Body, Controller, Delete, Get, Param, Post, Req } from "@nestjs/common";
import { InviteService } from "./invite.service";
import { InviteUserDto } from "./dto/inviteUser.dto";
import { ProjectAccess } from "../../common/decorators/project-access.decorator";


@Controller('invite')
export class InviteController{
    constructor(private readonly inviteService:InviteService){}

    @Get('list')
    getInvites(@Req() req:any){
        return this.inviteService.getInvites(req.user.userId)
    }

    @Get(':inviteId')
    getInviteData(@Param('inviteId') inviteId:string , @Req() req:any){
        return this.inviteService.getInviteData(inviteId , req.user.userId)
    }

    @Post()
    inviteUser(@Body() body:InviteUserDto , @Req() req:any){
        return this.inviteService.inviteUser(body.projectId , body.email , req.user.userId ,body.role)
    }

    @Get('list/:projectId')
    projectUsers(@Param('projectId') projectId:string ,@Req() req:any ){
        return this.inviteService.getProjectInvitedUsersAndOwner(projectId ,req.user.userId)
    }

    @Post('accept/:inviteId')
    acceptInvite(@Param('inviteId') inviteId:string ,@Req() req:any){
        return this.inviteService.acceptInvite(inviteId ,req.user.userId)
    }

    @Post('reject/:inviteId')
    reject(@Param('inviteId') inviteId:string ,@Req() req:any){
        return this.inviteService.rejectInvite(inviteId ,req.user.userId)
    }

    @ProjectAccess('ADMIN')
    @Delete('cancel/:projectId/:inviteId')
    cancelInvite(@Param('inviteId') inviteId:string ,@Req() req:any){
        return this.inviteService.cancelInvite(inviteId ,req.user.userId)
    }

    @ProjectAccess('ADMIN')
    @Delete('remove/:projectId/:inviteId')
    removeUserFromProject(@Param('inviteId') inviteId:string ,@Param('projectId') projectId:string,@Req() req:any){
        return this.inviteService.removeUserFromProject(inviteId, projectId ,req.user.userId)
    }

    @Delete('leave/:projectId')
    leaveProject(@Param('projectId') projectId:string,@Req() req:any){
        return this.inviteService.leaveProject(projectId ,req.user.userId)
    }

}