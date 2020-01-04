// @see https://github.com/panva/node-oidc-provider-example/blob/master/03-oidc-views-accounts/account.js
class Account {
  // This interface is required by oidc-provider
  static async findAccount(context, id) {
    console.log('find account');
    // This would ideally be just a check whether the account is still in your storage
    const account = db
      .get('users')
      .find({ id })
      .value();
    if (!account) {
      return undefined;
    }

    return {
      accountId: id,
      // and this claims() method would actually query to retrieve the account claims
      async claims() {
        return {
          sub: id,
          email: account.email,
          email_verified: account.email_verified,
        };
      },
    };
  }

  // This can be anything you need to authenticate a user
  /* fixme доделать - авторизуем на основе email/password и отдаем id */
  static async authenticate(email, password) {
    return 'test';
    try {
      const lowercased = String(email).toLowerCase();
      const account = db
        .get('users')
        .find({ email: lowercased })
        .value();

      return account.id;
    } catch (error) {
      return undefined;
    }
  }
}

module.exports = Account;
