// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    const roleName = 'Authenticated';
    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: roleName } });

    if (role) {
      const permissions = [
        'api::post.post.create',
        'plugin::upload.content-api.upload',
      ];

      const currentPermissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({
          where: {
            role: role.id,
            action: { $in: permissions },
          },
        });

      const existingActions = currentPermissions.map((p: any) => p.action);
      const newPermissions = permissions.filter(
        (action) => !existingActions.includes(action)
      );

      if (newPermissions.length > 0) {
        await Promise.all(
          newPermissions.map((action) =>
            strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: role.id,
              },
            })
          )
        );
        console.log(`Permissions granted for ${roleName}: ${newPermissions.join(', ')}`);
      }
    }
  },
};
