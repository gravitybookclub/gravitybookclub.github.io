const savePermissionToken = (token) => {
    localStorage.setItem('token', token);
}
const getPermissionForCurrentUser = () => {
    if (localStorage.getItem('token')) {
        return localStorage.getItem('token');
    }
}
const imbCli = window.location.href.includes('localhost') ? '1913d9e4da4bad3e2e3da03e19df0705' : '0a0c7f6f4038fc0699ced9f81b160a97';
const imb = new moneyButton.IMB({
    clientIdentifier: imbCli,
    permission: getPermissionForCurrentUser(), 
    onNewPermissionGranted: (token) => savePermissionToken(token)
});
