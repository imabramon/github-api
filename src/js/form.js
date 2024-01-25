const form = document.querySelector('.form')
const searchInput = form.querySelector('.form__input');
const datalist = form.querySelector('.form__datalist')
const repositories = document.querySelector('.list')


function makeRepo(item){
    const name = item.getAttribute("data-name")
    const owner = item.getAttribute("data-owner")
    const stars = item.getAttribute("data-stars")

    const node = listItemTemplate.content.firstElementChild.cloneNode(true)

    const nameNode = node.querySelector(".list-item__name")
    nameNode.innerText = name

    const ownerNode = node.querySelector(".list-item__owner")
    ownerNode.innerText = owner

    const starsNode = node.querySelector(".list-item__stars")
    starsNode.innerText = stars

    const button = node.querySelector('.list-item__close-button')
        button.addEventListener('click', ()=>{
            // console.log('button repo:', newRepo)
            repositories.removeChild(node)
        })

    return node;
}

function makeOption(item){
    const {name, owner, "watchers_count":stars} = item;
    const {login:ownerName} = owner 

    const node = document.createElement('li');

    node.innerText = name
    node.setAttribute("data-name", name)
    node.setAttribute("data-owner", ownerName)
    node.setAttribute("data-stars", stars)

    node.classList.add("datalist__option")

    node.addEventListener('click', ()=>{
        const repo = makeRepo(node)
        repositories.appendChild(repo)
        searchInput.value = ""
    })

    return node
}

function getSearchURL(query){
    return `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`
}

const debounce = (fn, debounceTime) => {
    let timer = undefined;
    
    return function(...args){
        if(timer !== undefined){
              clearTimeout(timer)
              timer = setTimeout(()=>{
               
                fn.call(this, ...args)
                clearTimeout(timer)
                timer = undefined
               
              }, debounceTime)
             
            return;
        }
        
         clearTimeout(timer)
         timer = setTimeout(()=>{
                fn.call(this, ...args)
                clearTimeout(timer)
                timer = undefined
         }, debounceTime)
    }
};

const autoComplete = debounce(()=>{
    const searchQuery = searchInput.value;
    fetch(getSearchURL(searchQuery))
        .then(response => response.json())
        .then(json=>{
            const items = json.items
            const newItems = items.map(makeOption)
            datalist.replaceChildren(... newItems)
        })
        .catch(e=>console.log('Ошибка - ', e))
}, 100)

searchInput.addEventListener('input', ()=>{
    autoComplete()
})

searchInput.addEventListener('focus', (evt)=>{
    if(this.value!=""){
        datalist.style['display'] = "block"
    }else{}
    
})

searchInput.addEventListener('blur', ()=>{
    setTimeout(()=>{
        datalist.style['display'] = "none"
        datalist.innerHTML = ''
    }, 100)
    
})
