import { google } from 'googleapis'
import path from 'path'
import fs from 'fs'

function getAuth() {
  // Vercel: 環境変数 GOOGLE_SERVICE_ACCOUNT_JSON からJSON文字列を読む
  const jsonEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (jsonEnv) {
    const credentials = JSON.parse(jsonEnv)
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
  }

  // ローカル: ファイルから読む
  const keyFile = path.join(process.cwd(), 'tsubukizemi-demo-a56da3c8ad18.json')
  if (fs.existsSync(keyFile)) {
    return new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
  }

  throw new Error('Google service account credentials not found')
}

const auth = getAuth()
export const drive = google.drive({ version: 'v3', auth })
