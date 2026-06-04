interface IAppOption {
  globalData: {
    userEmail: string
  }
  checkAuth(): boolean
}
