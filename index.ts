//#!/usr/bin/env deno

import { readFile, args, env, exit } from 'deno'

import createGistApi from './create-gist-api'

interface MainArguments {
	githubUsername: string,
	githubPassword: string,
	filePaths: string[],
}

const main = async ({ githubUsername, githubPassword, filePaths }: MainArguments) => {
	if (filePaths.length === 0) {
		printArgs()
		exit(0)
	}

	const authorization = `${githubUsername}:${githubPassword}`

	const namesAndPaths = filePaths.map(path => ({
		path,
		name: path.split('/').pop(),
	}))

	const decoder = new TextDecoder('UTF-8')

	const files = await Promise.all(
		namesAndPaths.map(
			async ({ name, path }) => {
				try {
					const content = await decoder.decode(await readFile(path))
					return {
						name,
						content,
					}
				} catch (err) {
					console.error('Error reading', path)
					throw err
				}
			}
		)
	)

	const response = await createGistApi(authorization, {
		name: namesAndPaths.map(({ name }) => name).join(', '),
		public: true,
		files: fileArrayToObject(files),
	})

	console.log('response', response)
}

const printArgs = () => console.log(`
Syntax:
gistd filename [...filenames]

Don't forget to set your GIST_GITHUB_USER and GIST_GITHUB_TOKEN environment variables first.
`)

const fileArrayToObject = (files: Array<{ name: string, content: string }>) => {
	const fileObject = {}

	files.forEach(file => {
		fileObject[file.name] = file.content
	})

	return fileObject
}




const [ , ...filePaths ] = args

const { GIST_GITHUB_USER, GIST_GITHUB_TOKEN } = env()

main({
	githubUsername: GIST_GITHUB_USER,
	githubPassword: GIST_GITHUB_TOKEN,
	filePaths,
})
