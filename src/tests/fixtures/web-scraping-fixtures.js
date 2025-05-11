/**
 * Test fixtures for web scraping tests
 */

const tableFixture = `
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>30</td>
        <td>john@example.com</td>
      </tr>
      <tr>
        <td>Jane Smith</td>
        <td>25</td>
        <td>jane@example.com</td>
      </tr>
    </tbody>
  </table>
`;

const linksFixture = `
  <div>
    <a href="https://example.com" id="link1">Example Link</a>
    <a href="https://test.com" id="link2">Test Link</a>
  </div>
`;

const textContentFixture = `
  <div>
    <p>First paragraph</p>
    <p>Second paragraph</p>
    <p>Third paragraph</p>
  </div>
`;

const structuredDataFixture = `
  <div>
    <h1 id="title">Page Title</h1>
    <p id="description">Page description</p>
    <span id="author">John Doe</span>
  </div>
`;

const domSnapshotFixture = `
  <div>
    <h1>Test Page</h1>
    <p>This is a test page</p>
  </div>
`;

module.exports = {
  tableFixture,
  linksFixture,
  textContentFixture,
  structuredDataFixture,
  domSnapshotFixture
};