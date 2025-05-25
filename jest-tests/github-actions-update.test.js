/**
 * Test for GitHub Actions update scripts
 * 
 * This test verifies that the GitHub Actions update scripts correctly generate
 * workflow files with the latest v4 versions of the actions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

describe('GitHub Actions Update Scripts', () => {
  const tempWorkflowPath = path.resolve(__dirname, '../.github/workflows/temp-test-workflow.yml');
  
  // Create a copy of the original workflow file for testing
  beforeEach(() => {
    const originalWorkflowPath = path.resolve(__dirname, '../.github/workflows/playwright.yml');
    const originalContent = fs.readFileSync(originalWorkflowPath, 'utf8');
    fs.writeFileSync(tempWorkflowPath, originalContent);
  });
  
  // Clean up after tests
  afterEach(() => {
    if (fs.existsSync(tempWorkflowPath)) {
      fs.unlinkSync(tempWorkflowPath);
    }
  });
  
  test('test-update-github-workflow.js generates valid YAML with v4 actions', () => {
    // Run the script in dry-run mode and capture its output
    const scriptPath = path.resolve(__dirname, '../scripts/test-update-github-workflow.js');
    const output = execSync(`node ${scriptPath} --dry-run`, { 
      env: { ...process.env, WORKFLOW_PATH: tempWorkflowPath }
    }).toString();
    
    // Check if the output contains v4 references
    expect(output).toContain('actions/checkout@v4');
    expect(output).toContain('actions/setup-node@v4');
    expect(output).toContain('actions/upload-artifact@v4');
    
    // Ensure it doesn't contain v3 references
    expect(output).not.toContain('actions/checkout@v3');
    expect(output).not.toContain('actions/setup-node@v3');
    expect(output).not.toContain('actions/upload-artifact@v3');
    
    // Verify the script reports valid YAML
    expect(output).toContain('Generated YAML is valid');
  });
  
  test('All workflow files use v4 actions', () => {
    const workflowsDir = path.resolve(__dirname, '../.github/workflows');
    const workflowFiles = fs.readdirSync(workflowsDir)
      .filter(file => file.endsWith('.yml'))
      .map(file => path.join(workflowsDir, file));
    
    for (const file of workflowFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Parse the YAML to verify it's valid
      const workflow = yaml.load(content);
      expect(workflow).toBeTruthy();
      
      // Check that the file uses v4 actions
      expect(content).not.toContain('actions/checkout@v3');
      expect(content).not.toContain('actions/setup-node@v3');
      expect(content).not.toContain('actions/upload-artifact@v3');
      expect(content).not.toContain('actions/download-artifact@v3');
      
      // For files that use these actions, verify they use v4
      if (content.includes('actions/checkout')) {
        expect(content).toContain('actions/checkout@v4');
      }
      
      if (content.includes('actions/setup-node')) {
        expect(content).toContain('actions/setup-node@v4');
      }
      
      if (content.includes('actions/upload-artifact')) {
        expect(content).toContain('actions/upload-artifact@v4');
      }
      
      if (content.includes('actions/download-artifact')) {
        expect(content).toContain('actions/download-artifact@v4');
      }
    }
  });
});