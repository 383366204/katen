const helper = require('./helper/helper');

helper.sendPhone('18928651029').then(id => {
    console.log(id);
})
.catch(err=>console.log(err))

// helper.veriPhoneCode('478732190817','619347')
// .then(isSuccess=>{
//     console.log(isSuccess);
// })
// .catch(err=>{
//     console.log(err+' register')
// })