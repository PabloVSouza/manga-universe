module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			builderOptions: {
				productName: "Manga Universe",
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
