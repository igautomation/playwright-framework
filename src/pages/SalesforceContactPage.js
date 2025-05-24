/**
 * SalesforceContactPage Page Object
 * Generated from https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new
 * @generated
 */
const { BasePage } = require('./BasePage');

class SalesforceContactPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Page URL
    this.url = 'https://wise-koala-a44c19-dev-ed.trailblaze.lightning.force.com/lightning/o/Contact/new';

    // Auth selectors
    this.username = '#username';
    this.password = '#password';
    this.loginButton = '#Login';

    // Contact form selectors
    this.salutation = '[name="salutation"]';
    this.firstName = 'input[name="firstName"]';
    this.lastName = 'input[name="lastName"]';
    this.phone = 'input[name="Phone"]';
    this.mobile = 'input[name="MobilePhone"]';
    this.email = 'input[name="Email"]';
    this.title = 'input[name="Title"]';
    this.department = 'input[name="Department"]';
    
    // Buttons
    this.saveButton = 'button[name="SaveEdit"]';
    this.cancelButton = 'button[name="CancelEdit"]';
  }

  /**
   * Navigate to the page
   * @param {Object} credentials - Salesforce credentials
   * @param {string} credentials.username - Salesforce username
   * @param {string} credentials.password - Salesforce password
   */
  async goto(credentials) {
    if (!credentials?.username || !credentials?.password) {
      throw new Error('Salesforce credentials are required');
    }

    // Handle Salesforce login first
    await this.page.goto('https://login.salesforce.com');
    await this.page.fill('#username', credentials.username);
    await this.page.fill('#password', credentials.password);
    await this.page.click('#Login');
    
    // Wait for Salesforce to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('one-app-nav-bar', { timeout: 30000 }).catch(() => {});

    // Now navigate to the actual Contact page
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('force-record-layout-section', { timeout: 30000 }).catch(() => {});
  }


  /**
   * Click hint_save_edit
   */
  async clickhint_save_edit() {
    await this.click(this.hint_save_edit);
  }

  /**
   * Click hint_back_edit
   */
  async clickhint_back_edit() {
    await this.click(this.hint_back_edit);
  }

  /**
   * Click login
   */
  async clicklogin() {
    await this.click(this.login);
  }

  /**
   * Click hint_back_domain
   */
  async clickhint_back_domain() {
    await this.click(this.hint_back_domain);
  }

  /**
   * Click mydomaincontinue
   */
  async clickmydomaincontinue() {
    await this.click(this.mydomaincontinue);
  }


  /**
   * Fill pqs
   * @param {string} value
   */
  async fillpqs(value) {
    await this.fill(this.pqs, value);
  }

  /**
   * Fill un_hfid
   * @param {string} value
   */
  async fillun_hfid(value) {
    await this.fill(this.un_hfid, value);
  }

  /**
   * Fill width
   * @param {string} value
   */
  async fillwidth(value) {
    await this.fill(this.width, value);
  }

  /**
   * Fill height
   * @param {string} value
   */
  async fillheight(value) {
    await this.fill(this.height, value);
  }

  /**
   * Fill hasrememberun
   * @param {string} value
   */
  async fillhasrememberun(value) {
    await this.fill(this.hasrememberun, value);
  }

  /**
   * Fill login_starturl
   * @param {string} value
   */
  async filllogin_starturl(value) {
    await this.fill(this.login_starturl, value);
  }

  /**
   * Fill loginurl
   * @param {string} value
   */
  async fillloginurl(value) {
    await this.fill(this.loginurl, value);
  }

  /**
   * Fill logintype
   * @param {string} value
   */
  async filllogintype(value) {
    await this.fill(this.logintype, value);
  }

  /**
   * Fill usesecure
   * @param {string} value
   */
  async fillusesecure(value) {
    await this.fill(this.usesecure, value);
  }

  /**
   * Fill local
   * @param {string} value
   */
  async filllocal(value) {
    await this.fill(this.local, value);
  }

  /**
   * Fill lt
   * @param {string} value
   */
  async filllt(value) {
    await this.fill(this.lt, value);
  }

  /**
   * Fill qs
   * @param {string} value
   */
  async fillqs(value) {
    await this.fill(this.qs, value);
  }

  /**
   * Fill locale
   * @param {string} value
   */
  async filllocale(value) {
    await this.fill(this.locale, value);
  }

  /**
   * Fill oauth_token
   * @param {string} value
   */
  async filloauth_token(value) {
    await this.fill(this.oauth_token, value);
  }

  /**
   * Fill oauth_callback
   * @param {string} value
   */
  async filloauth_callback(value) {
    await this.fill(this.oauth_callback, value);
  }

  /**
   * Fill login
   * @param {string} value
   */
  async filllogin(value) {
    await this.fill(this.login, value);
  }

  /**
   * Fill serverid
   * @param {string} value
   */
  async fillserverid(value) {
    await this.fill(this.serverid, value);
  }

  /**
   * Fill display
   * @param {string} value
   */
  async filldisplay(value) {
    await this.fill(this.display, value);
  }

  /**
   * Fill username
   * @param {string} value
   */
  async fillusername(value) {
    await this.fill(this.username, value);
  }

  /**
   * Fill extralog
   * @param {string} value
   */
  async fillextralog(value) {
    await this.fill(this.extralog, value);
  }

  /**
   * Fill password
   * @param {string} value
   */
  async fillpassword(value) {
    await this.fill(this.password, value);
  }

  /**
   * Fill login
   * @param {string} value
   */
  async filllogin(value) {
    await this.fill(this.login, value);
  }

  /**
   * Fill rememberun
   * @param {string} value
   */
  async fillrememberun(value) {
    await this.fill(this.rememberun, value);
  }

  /**
   * Fill mydomain
   * @param {string} value
   */
  async fillmydomain(value) {
    await this.fill(this.mydomain, value);
  }

  /**
   * Fill mydomain_suffix
   * @param {string} value
   */
  async fillmydomain_suffix(value) {
    await this.fill(this.mydomain_suffix, value);
  }

  /**
   * Fill community_suffix
   * @param {string} value
   */
  async fillcommunity_suffix(value) {
    await this.fill(this.community_suffix, value);
  }

  /**
   * Fill suffix0
   * @param {string} value
   */
  async fillsuffix0(value) {
    await this.fill(this.suffix0, value);
  }

  /**
   * Fill suffix1
   * @param {string} value
   */
  async fillsuffix1(value) {
    await this.fill(this.suffix1, value);
  }

  /**
   * Fill suffix2
   * @param {string} value
   */
  async fillsuffix2(value) {
    await this.fill(this.suffix2, value);
  }

  /**
   * Fill suffix3
   * @param {string} value
   */
  async fillsuffix3(value) {
    await this.fill(this.suffix3, value);
  }

  /**
   * Fill suffix4
   * @param {string} value
   */
  async fillsuffix4(value) {
    await this.fill(this.suffix4, value);
  }

  /**
   * Fill suffix5
   * @param {string} value
   */
  async fillsuffix5(value) {
    await this.fill(this.suffix5, value);
  }

  /**
   * Fill suffix6
   * @param {string} value
   */
  async fillsuffix6(value) {
    await this.fill(this.suffix6, value);
  }

  /**
   * Fill suffix7
   * @param {string} value
   */
  async fillsuffix7(value) {
    await this.fill(this.suffix7, value);
  }

  /**
   * Fill suffix8
   * @param {string} value
   */
  async fillsuffix8(value) {
    await this.fill(this.suffix8, value);
  }

  /**
   * Fill suffix9
   * @param {string} value
   */
  async fillsuffix9(value) {
    await this.fill(this.suffix9, value);
  }

  /**
   * Fill suffix10
   * @param {string} value
   */
  async fillsuffix10(value) {
    await this.fill(this.suffix10, value);
  }

  /**
   * Fill suffix11
   * @param {string} value
   */
  async fillsuffix11(value) {
    await this.fill(this.suffix11, value);
  }

}

module.exports = SalesforceContactPage;