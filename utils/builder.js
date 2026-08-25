exports.buildResponds = (info) =>{
    const{password,id, ...rest} = info;
    rest.userId = id;
    return rest;
}
