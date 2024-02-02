export function spawnUiApp(appName, appId, params, apps) {
    // console.log(`spawnUiApp ${appName}`, params)
    const props = params ? params.props : null
    const appKey = `${appName}${appId}`

    apps.push({
    name: appName,
        appId: appId,
        appKey: appKey,
        comp: appName,
        props: props,
        teleport: `#${appName + appId}`
    })
}

export function destroyUiApp(appName, apps) {
    const app = apps.find(x => x.name === appName)
    const index = apps.indexOf(app)

    if (index > -1) {
        // console.log('deleted vue app', apps[index].name)
        apps.splice(index, 1)
    }
}

export function registerApps(app, componentsMap) {
    const keys = Object.keys(componentsMap)
    keys.forEach((key) => {
        app.component(key, componentsMap[key])
    })
}