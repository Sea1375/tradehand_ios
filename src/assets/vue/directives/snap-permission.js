import store from './../store';

export default {
    inserted (el, binding) {
        let permissions = [];

        if (typeof binding.value === 'string') {
            permissions = [binding.value];
        }
        else {
            permissions = binding.value;
        }

        let userPermissions;
        if (store.state.user) {
            userPermissions = store.state.user.modules;
        }
        else {
            userPermissions = undefined;
        }

        let found = false;

        if (userPermissions && permissions) {
            permissions.forEach((permission) => {
                if (userPermissions.indexOf(permission) !== -1) {
                    found = true;
                }
            });

            if (!found) {
                el.parentNode.removeChild(el);
            }
        }
    },
};
