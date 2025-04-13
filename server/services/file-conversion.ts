
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class FileConversionService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async convertToMarkdown(file: Express.Multer.File): Promise<string> {
    const filePath = path.join(this.uploadDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    try {
      const output = execSync(`pandoc -f ${this.getInputFormat(file.originalname)} -t markdown ${filePath}`);
      fs.unlinkSync(filePath);
      return output.toString();
    } catch (error) {
      fs.unlinkSync(filePath);
      throw new Error('Conversion failed');
    }
  }

  private getInputFormat(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const formats: Record<string, string> = {
      '.docx': 'docx',
      '.doc': 'doc',
      '.pdf': 'pdf',
      '.pptx': 'pptx',
      '.ppt': 'ppt',
      '.xlsx': 'xlsx',
      '.xls': 'xls'
    };
    return formats[ext] || 'txt';
  }
}

export const fileConversionService = new FileConversionService();
