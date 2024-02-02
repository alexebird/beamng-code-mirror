export function customDisposePlugin(context) {
  const store = context.store
  const { $dispose, dispose } = store
  store.$dispose = () => {
    $dispose()
    if (dispose && typeof dispose === "function") dispose()
  }
}
