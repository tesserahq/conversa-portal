// Loads dotenv before running the build
import 'dotenv/config'
import { execSync } from 'child_process'

// Executes react-router build with environment variables available
execSync('react-router build', { stdio: 'inherit' })
