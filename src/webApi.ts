class WebApiWrapper {
  public get AudioContext() {
    return (<any>window).AudioContext || (<any>window).webkitAudioContext as AudioContext
  }
}

export const WebApi = new WebApiWrapper()