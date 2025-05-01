function getReisterData(body){
    try{
        const {username,password} = body;
        return {"username":username,"password":password};
    }catch(e){
        return false;
    }
}
module.exports = {getReisterData};