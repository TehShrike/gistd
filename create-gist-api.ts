interface PostGistBody {
	public: boolean,
	name: string,
	files: {
		[NAME: string]: string
	}
}

export default async (authorization: string, body: PostGistBody) => {
	const headers = new Headers()
	headers.append(`Content-Type`, `application/json`)
	headers.append('User-Agent', 'tehshrike-gistd')
	headers.append('Authorization', authorization)

	const response = await fetch(`https://api.github.com/gists`, {
		headers: headers,
		method: 'POST',
		body: JSON.stringify(body)
	})

	try {
		return await response.json()
	} catch (err) {
		const message = await response.text()
		throw new Error(message)
	}
}
