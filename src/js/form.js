const form = document.querySelector('.form')
const searchInput = form.querySelector('.form__input')
const datalist = form.querySelector('.form__datalist')
const repositories = document.querySelector('.list')

let flag = true /* Сомнтительно но окей */

const showAutoCompete = () => {
  datalist.style['display'] = 'block'
}

const hideAutoCompete = () => {
  setTimeout(() => {
    datalist.style['display'] = 'none'
  }, 100)
}

function makeLoading() {
  const template = listLoadingTemplate.content.firstElementChild
  const node = template.cloneNode(true)
  return node
}

function makeRepo(item) {
  const name = item.getAttribute('data-name')
  const owner = item.getAttribute('data-owner')
  const stars = item.getAttribute('data-stars')

  const node = listItemTemplate.content.firstElementChild.cloneNode(true)

  const nameNode = node.querySelector('.list-item__name')
  nameNode.innerText = name

  const ownerNode = node.querySelector('.list-item__owner')
  ownerNode.innerText = owner

  const starsNode = node.querySelector('.list-item__stars')
  starsNode.innerText = stars

  const button = node.querySelector('.list-item__close-button')
  button.addEventListener('click', () => {
    // console.log('button repo:', newRepo)
    repositories.removeChild(node)
  })

  return node
}

function makeOption(item) {
  const { name, owner, 'watchers_count': stars } = item
  const { login: ownerName } = owner

  const node = document.createElement('li')

  node.innerText = name
  node.setAttribute('data-name', name)
  node.setAttribute('data-owner', ownerName)
  node.setAttribute('data-stars', stars)

  node.classList.add('datalist__option')

  node.addEventListener('click', () => {
    const repo = makeRepo(node)
    searchInput.value = ''
    repositories.appendChild(repo)
    datalist.innerHTML = ''
  })

  return node
}

function makeSorry() {
  const template = listSorryTemplate.content.firstElementChild
  const node = template.cloneNode(true)
  return node
}

function getSearchURL(query) {
  console.log(query)
  return `https://api.github.com/search/repositories?q=${encodeURIComponent(
    query
  )}&per_page=5`
}

const debounce = (fn, debounceTime) => {
  /*Да, мне было страшно, но я это сделал */
  let timer = undefined

  return function (...args) {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn.call(this, ...args)
        clearTimeout(timer)
        timer = undefined
      }, debounceTime)

      return
    }

    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.call(this, ...args)
      clearTimeout(timer)
      timer = undefined
    }, debounceTime)
  }
}

function getAutoComplete(query) {
  fetch(getSearchURL(query))
    .then((response) => {
      // console.log('ответ сервера', response)
      return response.json()
    })
    .then((data) => {
      // console.log('джсейсон в ответе', data)
      const items = data.items
      if (items) {
        const newItems = items.map(makeOption)
        datalist.replaceChildren(...newItems)
        return
      }
      flag = false
      datalist.replaceChildren(makeSorry())
    })
    .catch((e) => console.log('Я ошибся! Я могу один раз ошибиться?', e))
}

const getAutoCompleteDebounced = debounce((searchQuery) => {
  getAutoComplete(searchQuery)
}, 500)

searchInput.addEventListener('input', (evt) => {
  const value = searchInput.value
  if (flag) {
    if (value) {
      datalist.replaceChildren(makeLoading())
      getAutoCompleteDebounced(value)
    } else {
      datalist.innerHTML = ''
    }
  }
})

// Я — великий грешник

searchInput.addEventListener('focus', showAutoCompete)
searchInput.addEventListener('blur', hideAutoCompete)
