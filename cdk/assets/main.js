$(document).ready(function () {
  getApiStatus();
});

function getApiStatus() {
  var apigClient = apigClientFactory.newClient();
  var params = {};
  var body = {};
  var additionalParams = {};

  try {
    apigClient.catsGet(params, body, additionalParams)
      .then(function (result) {
        $('#trc-cats-view').removeClass('disabled');
        $('#trc-cats-status').removeClass('fa-times-circle');
        $('#trc-cats-status').addClass('fa-check-circle');
        $('#trc-cats-status').removeClass('trc-color-red');
        $('#trc-cats-status').addClass('trc-color-green');
        setInterval(getApiStatus, 300000);
      }).catch(function (result) {
        $('#trc-cats-view').addClass('disabled');
        $('#trc-cats-status').addClass('fa-times-circle');
        $('#trc-cats-status').removeClass('fa-check-circle');
        $('#trc-cats-status').addClass('trc-color-red');
        $('#trc-cats-status').removeClass('trc-color-green');
        setInterval(getApiStatus, 30000);
      });
  } catch (error) {
    console.log(error)
  }
}


