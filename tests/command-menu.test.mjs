import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

const source = await readFile(new URL('../app/composables/useCommandMenu.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText

function createMenu() {
  const state = new Map()
  const listeners = new Map()
  const mounted = []
  const unmounted = []
  const environment = {
    exports: {},
    modalOpen: false,
    useState: (key, initialize) => {
      if (!state.has(key)) state.set(key, { value: initialize() })
      return state.get(key)
    },
    onMounted: callback => mounted.push(callback),
    onUnmounted: callback => unmounted.push(callback),
    document: { querySelector: () => environment.modalOpen ? {} : null },
    window: {
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name, callback) => { if (listeners.get(name) === callback) listeners.delete(name) }
    }
  }
  vm.runInNewContext(compiled, environment)
  const menu = environment.exports.useCommandMenu({ shortcuts: true })
  mounted.forEach(callback => callback())
  const press = (overrides = {}) => {
    const event = { key: 'k', ctrlKey: true, metaKey: false, isComposing: false, repeat: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, ...overrides }
    listeners.get('keydown')?.(event)
    return event
  }
  return { menu, environment, listeners, press, unmount: () => unmounted.forEach(callback => callback()) }
}

test('search shortcut is available before the lazy search component mounts', () => {
  const { menu, environment, press } = createMenu()
  assert.equal(menu.isOpen.value, false)
  assert.equal(press().defaultPrevented, true)
  assert.equal(menu.isOpen.value, true)
  // A component created later sees the same open state without another listener.
  const searchDialog = environment.exports.useCommandMenu()
  assert.equal(searchDialog.isOpen, menu.isOpen)
  searchDialog.close()
  assert.equal(menu.isOpen.value, false)
  press({ ctrlKey: false, metaKey: true, key: 'K' })
  assert.equal(menu.isOpen.value, true)
  press({ ctrlKey: false, metaKey: true })
  assert.equal(menu.isOpen.value, false)
})

test('search does not steal the keyboard from an existing modal', () => {
  const { menu, environment, press } = createMenu()
  environment.modalOpen = true
  assert.equal(press().defaultPrevented, false)
  assert.equal(menu.isOpen.value, false)
  environment.modalOpen = false
  press()
  environment.modalOpen = true
  assert.equal(press().defaultPrevented, true)
  assert.equal(menu.isOpen.value, false)
})

test('ordinary typing, composition, handled keys and repeated keydown leave search closed', () => {
  const { menu, press } = createMenu()
  for (const overrides of [{ ctrlKey: false }, { key: 'j' }, { isComposing: true }, { repeat: true }, { defaultPrevented: true }]) {
    press(overrides)
    assert.equal(menu.isOpen.value, false)
  }
})

test('unmounting the shell removes its global shortcut', () => {
  const { menu, listeners, press, unmount } = createMenu()
  assert.equal(listeners.size, 1)
  unmount()
  assert.equal(listeners.size, 0)
  press()
  assert.equal(menu.isOpen.value, false)
})
