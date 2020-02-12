$(document).ready(function () {
  getApiStatus();

  $('input[type="file"]').change(function (e) {
    var fileName = e.target.files[0].name;
    $('.custom-file-label').html(fileName);
  });
});

function getApiStatus() {
  checkCatsApi();
  checkDogsApi();
};

function refreshCatsApi() {
  $('.trc-cat-gallery').empty();

  $('#trc-cats-view').addClass('disabled');
  $('#trc-cats-status').addClass('fa-times-circle');
  $('#trc-cats-status').removeClass('fa-check-circle');
  $('#trc-cats-status').addClass('trc-color-red');
  $('#trc-cats-status').removeClass('trc-color-green');

  checkCatsApi();
};

function refreshDogsApi() {
  $('.trc-dog-gallery').empty();

  $('#trc-dogs-view').addClass('disabled');
  $('#trc-dogs-status').addClass('fa-times-circle');
  $('#trc-dogs-status').removeClass('fa-check-circle');
  $('#trc-dogs-status').addClass('trc-color-red');
  $('#trc-dogs-status').removeClass('trc-color-green');

  checkDogsApi();
};

function checkCatsApi() {

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
        getCats();
      }).catch(function (result) {
        $('#trc-cats-view').addClass('disabled');
        $('#trc-cats-status').addClass('fa-times-circle');
        $('#trc-cats-status').removeClass('fa-check-circle');
        $('#trc-cats-status').addClass('trc-color-red');
        $('#trc-cats-status').removeClass('trc-color-green');
      });
  } catch (error) {
    console.log(error);
  }
};

function checkDogsApi() {
  var apigClient = apigClientFactory.newClient();
  var params = {};
  var body = {};
  var additionalParams = {};

  try {
    apigClient.dogsGet(params, body, additionalParams)
      .then(function (result) {
        $('#trc-dogs-view').removeClass('disabled');
        $('#trc-dogs-status').removeClass('fa-times-circle');
        $('#trc-dogs-status').addClass('fa-check-circle');
        $('#trc-dogs-status').removeClass('trc-color-red');
        $('#trc-dogs-status').addClass('trc-color-green');
        getDogs();
      }).catch(function (result) {
        $('#trc-dogs-view').addClass('disabled');
        $('#trc-dogs-status').addClass('fa-times-circle');
        $('#trc-dogs-status').removeClass('fa-check-circle');
        $('#trc-dogs-status').addClass('trc-color-red');
        $('#trc-dogs-status').removeClass('trc-color-green');
      });
  } catch (error) {
    console.log(error);
  }
};

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

function uploadImage() {

  myFiles = $('#inputGroupFileUpload').prop('files');

  if (myFiles.length > 0) {
    var apigClient = apigClientFactory.newClient();
    var params = {};
    var additionalParams = {};

    Array.from(myFiles).forEach(async file => {

      var base64Full = await toBase64(file);

      var regEx = /.*(;base64,)(.*)/gm;
      var base64Matches = regEx.exec(base64Full)

      var body = JSON.stringify({
        'encoded_image': base64Matches[2]
      });

      console.log(body);

      apigClient.uploadPost(params, body, additionalParams);
    });
  };

};

function getCats() {
  var apigClient = apigClientFactory.newClient();
  var params = {};
  var body = {};
  var additionalParams = {};

  checkForCats(apigClient);
};

function checkForCats(client, params, body, additionalParams) {
  if ($('div').hasClass('trc-cat-gallery') && !$('#trc-cats-view').hasClass('disabled')) {
    client.catsGet(params, body, additionalParams)
      .then(function (result) {
        result.data.cats.forEach(cat => {
          $('.trc-cat-gallery').append(`
          <div class="col-md-4 col-lg-4 col-xl-4">
            <img src="https://cdn.awsusergroup.wien/${cat.objectkey}" class="img-fluid" alt="${cat.objectkey}" id="${cat.objectkey}" />
          </div>`)
          console.log(cat.objectkey)
        });
      }).catch(function (result) {
        console.log(result);
      });
  };
};

function getDogs() {
  var apigClient = apigClientFactory.newClient();
  var params = {};
  var body = {};
  var additionalParams = {};

  checkForDogs(apigClient);
};

function checkForDogs(client, params, body, additionalParams) {
  if ($('div').hasClass('trc-dog-gallery') && !$('#trc-dog-view').hasClass('disabled')) {
    client.dogsGet(params, body, additionalParams)
      .then(function (result) {
        result.data.dogs.forEach(dog => {
          $('.trc-dog-gallery').append(`
          <div class="col-md-4 col-lg-4 col-xl-4">
            <img src="https://cdn.awsusergroup.wien/${dog.objectkey}" class="img-fluid" alt="${dog.objectkey}" id="${dog.objectkey}" />
          </div>`)
          console.log(dog.objectkey)
        });
      }).catch(function (result) {
        console.log(result);
      });
  };
};


