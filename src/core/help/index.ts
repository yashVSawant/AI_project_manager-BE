export const buildComponentTree=(components: any[], componentConditions: any[])=> {
  const map = new Map<string, any>();

  components.forEach((comp) => {
    map.set(comp.id, {
      ...comp,
      children: [],
      conditions: componentConditions
        .filter((cc) => cc.componentId === comp.id)
        .map((cc) => ({
          conditionId: cc.conditionId,
          action: cc.action,
        })),
    });
  });

  const tree: any[] = [];

  map.forEach((comp) => {
    if (comp.parentId) {
      const parent = map.get(comp.parentId);
      if (parent) parent.children.push(comp);
    } else {
      tree.push(comp);
    }
  });

  return tree;
}