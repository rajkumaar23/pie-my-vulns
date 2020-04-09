/* eslint-disable security/detect-child-process */
const path = require('path')
const util = require('util')
const childProcess = require('child_process')
const spawnAsync = util.promisify(childProcess.execFile)
const exec = childProcess.execSync
const spawnSync = childProcess.spawnSync

// wait 1.5 minutes on each test case
jest.setTimeout(90000)

const cliBinPath = path.join(__dirname, '../../bin/pie-my-vulns.js')

describe('End-to-End CLI', () => {
  beforeAll(() => {
    const cmdForToken = `npx snyk config set "api=$SNYK_TEST_TOKEN"`
    const res = exec(cmdForToken)
    console.log(res.toString())
  })

  test('CLI should return error code 2 when vulnerabilities are found', () => {
    /* eslint-disable */
    expect.assertions(1)

    try {
      const res = spawnSync('node', [cliBinPath], {
        cwd: path.join(__dirname, 'project1')
      })
    } catch(err) {
      console.log('error detected:')
      console.log(err) 
      console.log(err)
      console.log(err && err.stdout)
      console.log(err && err.stderr)
    }
    
    console.log(res)
    
//     try {
//       await spawnAsync('node', [cliBinPath], {
//         cwd: path.join(__dirname, 'project1')
//       })
//     } catch (err) {
//       expect(err.code).toBe(2) // means that vulnerabilities were found
//       console.log(err)
//       console.log(err && err.stdout)
//       console.log(err && err.stderr)
//     }
    /* eslint-enable */
  })

  test('CLI should show vulnerabilities breakdown numbers and their titles', async () => {
    expect.hasAssertions()

    try {
      await spawnAsync('node', [cliBinPath], {
        cwd: path.join(__dirname, 'project1')
      })
    } catch (err) {
      console.log(err)
      console.log(err && err.stdout)
      console.log(err && err.stderr)
      expect(err.stdout).toContain('Medium severity (20.00%)')
      expect(err.stdout).toContain('High severity (0.00%)')
      expect(err.stdout).toContain('Low severity (80.00%)')
      expect(err.stdout).toContain('Patchable vulnerabilities (0.00%)')
      expect(err.stdout).toContain('No remediation available (0.00%)')
      expect(err.stdout).toContain('Total number of vulnerabilities found')
      expect(err.stdout).toContain('Total number of dependencies scanned')
      expect(err.stdout).toContain('Vulnerabilities by severity:')
      expect(err.stdout).toContain('Vulnerabilities by remediation action:')
    }
  })

  test('CLI should return error code 1 when there is an issue', async () => {
    expect.assertions(2)

    try {
      await spawnAsync('node', [cliBinPath], {
        cwd: path.join(__dirname, 'project2')
      })
    } catch (err) {
      console.log(err)
      console.log(err && err.stdout)
      console.log(err && err.stderr)
      expect(err.code).toBe(1)
      expect(err.stderr).toContain('Unexpected failure: missing node_modules folders')
    }
  })

  test('CLI should return error code 0 when no vulnerabilities are found', async () => {
    const { stdout, err } = await spawnAsync('node', [cliBinPath], {
      cwd: path.join(__dirname, 'project3')
    })
    console.log(err)
    console.log(err && err.stdout)
    console.log(err && err.stderr)
    console.log(stdout)
    expect(err).toBe(undefined)
    expect(stdout).toContain('0 vulnerabilities found')
  })

  test('CLI should accept path to project directory from command argument', async () => {
    const project3Dir = path.join(__dirname, 'project3')
    const { stdout, err } = await spawnAsync('node', [cliBinPath, '--directory', project3Dir], {
      cwd: path.join(__dirname, 'project1')
    })

    expect(err).toBe(undefined)
    expect(stdout).toContain('0 vulnerabilities found')
  })
})
