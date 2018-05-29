let axios = require('axios');

let param = {"20180522112129761952956":{"8ck_0":{"shidu":{"senorName":"大气湿度","value":"789"}}}};

axios.post('http://10.1.5.89:8082/data/putdata',{
  param:JSON.stringify(param)
})
  .then(response => {
    console.log(response.data);
  })
  .catch(err => {
    console.log(err);
  })