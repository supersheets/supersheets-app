// https://developers.google.com/identity/sign-in/web/reference

export async function initGoogleOAuth(gapi, options) {
  await load(gapi)
  let GoogleAuth = await init(gapi, options)
  return GoogleAuth
}

export async function load(gapi) {
  return new Promise((resolve, reject) => {
    gapi.load('auth2', () => {
      resolve()
    })
  })
}

// returns a promise which resolves to a GoogleAuth object
export async function init(gapi, options) {
  let GoogleAuth = gapi.auth2.init(options)
  // GoogleAuth.isSignedIn.listen(updateSigninStatus)
  return new Promise((resolve, reject) => {
    GoogleAuth.then(resolve, reject)
  })
}

// function updateSigninStatus(isSignedIn) {
//   console.log('updateSigninStatus', isSignedIn)
// }