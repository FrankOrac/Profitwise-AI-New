
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ConversionResult {
  markdown: string;
  originalFileName: string;
}

export class FileConversionService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processFile(buffer: Buffer, originalName: string): Promise<ConversionResult> {
    const filePath = path.join(this.uploadDir, originalName);
    fs.writeFileSync(filePath, buffer);

    try {
      const markdown = await this.convertToMarkdown(filePath, originalName);
      return {
        markdown,
        originalFileName: originalName
      };
    } catch (error) {
      throw new Error(`Conversion failed: ${(error as Error).message}`);
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private async convertToMarkdown(filePath: string, fileName: string): Promise<string> {
    const format = this.getInputFormat(fileName);
    const output = execSync(`pandoc -f ${format} -t markdown ${filePath}`);
    return output.toString();
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
      '.xls': 'xls',
      '.txt': 'txt',
      '.md': 'markdown'
    };
    
    const format = formats[ext];
    if (!format) {
      throw new Error(`Unsupported file format: ${ext}`);
    }
    return format;
  }
}

export const fileConversionService = new FileConversionService();
