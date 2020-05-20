/**
 * @returns {string}
 */
module.exports = () => {
  return `
    <h1>Registration Step 1</h1>
    <h2>Enter your phone</h2>
    <form action="/registration/oauth/" method="post">
      <label for="phone">Enter phone: </label>
      <input
        required
        id="phone"
        type="tel"
        name="phone"
        minlength="9"
        maxlength="17"
        placeholder="+7(123)456-78-90"
      >
      <input type="submit">
    </form>
`;
};
