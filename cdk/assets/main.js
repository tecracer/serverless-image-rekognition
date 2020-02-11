$(document).ready(function () {
  getApiStatus();

  $('input[type="file"]').change(function (e) {
    var fileName = e.target.files[0].name;
    $('.custom-file-label').html(fileName);
  });
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
        getCats();
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
    console.log(error);
  }
};

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

async function Main() {
  const file = document.querySelector('#myfile').files[0];
  console.log(await toBase64(file));
}

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


