import { google, type drive_v3 } from 'googleapis'
import path from 'path'
import fs from 'fs'

let _drive: drive_v3.Drive | null = null

export function getDrive(): drive_v3.Drive {
  if (_drive) return _drive

  const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (jsonEnv) {
    const credentials = JSON.parse(jsonEnv)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
    _drive = google.drive({ version: 'v3', auth })
    return _drive
  }

  const keyFile = path.join(process.cwd(), 'tsubukizemi-demo-a56da3c8ad18.json')
  if (fs.existsSync(keyFile)) {
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
    _drive = google.drive({ version: 'v3', auth })
    return _drive
  }

  throw new Error('Google service account credentials not found')
}
