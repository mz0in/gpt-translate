import { availableFileExtensions } from './const'
import path from 'path'
import { postError, removeSymbols } from './utils'
import { COMMAND_USAGE, INVALID_FILE_EXTENSION } from './error'

export const isValidFileExt = (filename: string): boolean => {
  // Allow input file extension inheritance by asterisk in addition to normal file formats
  const fileExts = [...availableFileExtensions, '*']
  return fileExts.some((type) => filename.endsWith(type))
}

export const commandValidator = async (
  userCommand: string | undefined,
  match: RegExpExecArray | null,
): Promise<{
  inputFilePath: string
  outputFilePath: string
  targetLang: string
}> => {
  if (!match || match.length < 4) {
    await postError(`Invalid command: \`${userCommand}\`\n${COMMAND_USAGE}`)
  }

  const [, inputFilePath, outputFilePath, targetLang] = match!

  if (!isValidFileExt(inputFilePath) || !isValidFileExt(outputFilePath)) {
    await postError(INVALID_FILE_EXTENSION)
  }

  const inputFileName = path.basename(inputFilePath)
  const outputFileName = path.basename(outputFilePath)

  // If multiple files are specified, input and output must be specified in the same way.
  if (
    (inputFileName.includes('*') && !outputFileName.includes('*')) ||
    (!inputFileName.includes('*') && outputFileName.includes('*'))
  ) {
    await postError(
      `Error: Multiple file specification mismatch.\n${inputFileName} and ${outputFileName}`,
    )
  }

  return {
    inputFilePath,
    outputFilePath,
    targetLang: removeSymbols(targetLang),
  }
}
