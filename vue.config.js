module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			builderOptions: {
				productName: "Manga Universe",
				win: {
					icon: "./icon.ico",
				},
				publish: [
					{
						provider: "github",
						owner: "PabloVSouza",
						repo: "manga-universe",
						releaseType: "draft",
						allowToChangeInstallationDirectory: true,
					},
				],
			},
		},
	},
}
