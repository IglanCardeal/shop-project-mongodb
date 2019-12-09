module.exports = (link, token) =>
  `
<div style="text-align: center;">
  <h1>You requested a password reset!</h1>
  <h3 style="color: red">
    Ignore this message and do not click on link if you did not request a password reset on our website.
  </h3>
  <p>
    Click this <a href="${link}/reset/${token}">link</a> to set your new password!
  </p>
</div>
`;
