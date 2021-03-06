import getGroups from './get_groups';
import setKibanaIndex from './set_kibana_index';
import validateByLdap from './ldap/validate';
import validateByLocal from './local/validate';

export default function (server, request, remoteUser, kibanaIndexSuffix, callback) {

  const config = server.config();

  if (remoteUser == kibanaIndexSuffix) {
    server.log(['plugin:own-home', 'debug'], 'kibanaIndexSuffix matches remote user name: ' + kibanaIndexSuffix);
    setKibanaIndex(server, request, remoteUser, kibanaIndexSuffix);
    return (callback === null) ? true : getGroups(server, request, remoteUser, callback);
  }

  if (config.get('own_home.local.enabled')) {
    if (validateByLocal(server, kibanaIndexSuffix)) {
      server.log(['plugin:own-home', 'debug'], 'kibanaIndexSuffix matches local group: ' + kibanaIndexSuffix);
      setKibanaIndex(server, request, remoteUser, kibanaIndexSuffix);
      return (callback === null) ? true : getGroups(server, request, remoteUser, callback);
    }
  }

  if (config.get('own_home.ldap.enabled')) {
    return validateByLdap(server, request, remoteUser, kibanaIndexSuffix, callback);
  } else {
    return (callback === null) ? false : getGroups(server, request, remoteUser, callback);
  }
};
