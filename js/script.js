var countries = [];

async function fetchCountries() {

  var fetched = [];

  await fetch("https://restcountries.com/v3.1/all?").then(response => response.json()).then(data => fetched = Array.from(data));

  return fetched;
}

countries = await fetchCountries();
console.log(countries);

async function fetchNews(country) {
  var fetched = [];
  var url = `https://newsapi.org/v2/top-headlines?country=${country.cca2.toLowerCase()}&apiKey=7c565f8485d748cfa827e33f58c5716f`;
  await fetch(url).then(res => res.json()).then(data => fetched = Array.from(data.articles));

  return fetched;
}


var countriesModule = {

  init: function () {
    this.cacheElements();
    this.render();
  },

  cacheElements: function () {

    this.target = document.querySelector('#carouselContent');
    this.renderedCards = [];
  },

  render: function () {
    // render all cards from the fetched countries
    countries.forEach(country => {

      const cardTemplate =
        `
      <div class="card">
        <img src="{{flags.svg}}" class="card-img-top" alt="{{flag}}" />

        <div class="card-body text-center">
          <h3>{{name.common}}</h3>

          <h5>{{capital.0}}</h5>

          <button class="btn btn-primary my-3 viewNews" data-country="${country.name.common}"> View News </button>
        </div>
      </div>
      `;

      const rendered = Mustache.render(cardTemplate, country);
      this.renderedCards.push(rendered);
    });

    // add the cards rendered above to the carousel
    for (var i = 0; i < this.renderedCards.length; i += 4) {

      var template =
        `
      <div class="carousel-item ${i === 0 ? "active" : ""}">

        <div class="cards-wrapper">

          ${this.renderedCards[i]}

          ${this.renderedCards[i + 1]}
          
          ${this.renderedCards[i + 2]}
          
          ${this.renderedCards[i + 3]}

        </div>

      </div>
      `;

      this.target.innerHTML += template;
    }

    // add event listeners to each card (on the button not the card itself) to view news of the country 
    var buttons = document.getElementsByClassName("viewNews");

    Array.prototype.forEach.call(buttons, function (button) {

      button.addEventListener('click', function () {

        var currentCountryName = button.dataset.country;

        var currentCountry = countries.find(country => country.name.common === currentCountryName);

        eventsMediator.emit('current.country.changed', currentCountry);
      });

    });

  }
}

var statsModule = {

  currentCountry: {},

  init: function () {
    eventsMediator.on('current.country.changed', this.setCurrentCountry.bind(this));
    this.cacheElements();
  },

  setCurrentCountry: function (country) {
    this.currentCountry = country;
    this.render();
  },

  cacheElements: function () {

    this.target = document.querySelector('#statsContainer');

  },

  render: function () {

    if (this.currentCountry) {

      var flagTemplate =
        `
      <img src=${this.currentCountry.flags.svg} alt=${this.currentCountry.flag} />
      `;

      var currencies = "";
      var currenciesArray = Object.values(this.currentCountry.currencies);
      currenciesArray.forEach(currency => {
        currencies += `${currenciesArray.indexOf(currency) === 0 ? "" : ", "} ${currency.name}`;
      })

      var statsTemplate =
        `
      <div class="container d-flex flex-column text-center" id="stats">
        <h3>${this.currentCountry.name.common}</h3>

        <p>Capital: ${this.currentCountry.capital[0]}</p>

        <p>Currencies: ${currencies}</p>

        <p>Language: ${this.currentCountry.languages[Object.keys(this.currentCountry.languages)[0]]}</p>

        <p>Population: ${this.currentCountry.population}</p>

        <p>Subregion: ${this.currentCountry.subregion}</p>

        <p>Timezone: ${this.currentCountry.timezones[0]}</p>
      </div>
      `;

      this.target.innerHTML = "";
      this.target.innerHTML += flagTemplate;
      this.target.innerHTML += statsTemplate;

    }

  }
}

var newsModule = {
  currentCountry: {},
  articles: [],

  init: function () {
    this.cacheElements();
    eventsMediator.on('current.country.changed', this.setCurrentCountry.bind(this));
  },

  cacheElements: function () {
    this.target = document.querySelector('#newsContainer');
  },

  setCurrentCountry: async function (country) {
    this.currentCountry = country;
    this.articles = await fetchNews(country);
    console.log("Articles: ", this.articles);
    this.render();
  },

  render: function () {

    this.target.innerHTML = "";

    if (this.articles.length) {
      this.articles.forEach(article => {

        var date = new Date(article.publishedAt);

        var newsTemplate =
          `
        <div class="container w-80 border border-white d-flex">
            <img src="${article.urlToImage}" alt="Article Image" />

            <div class="container d-flex flex-column">
              <h3>${article.title}</h3>

              <p>${article.description}</p>

              <p>${article.source.name}</p>

              <p>${date.toUTCString()}</p>
            </div>
          </div>
        `;

        this.target.innerHTML += newsTemplate;

      });
    } else {
      this.target.innerHTML = "<h1> No News Available </h1>";
    }
  }
}

var eventsMediator = {
  events: {},
  on: function (eventName, callbackfn) {
    this.events[eventName] = this.events[eventName]
      ? this.events[eventName]
      : [];
    this.events[eventName].push(callbackfn);
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (callBackfn) {
        callBackfn(data);
      });
    }
  },
};

countriesModule.init();
statsModule.init();
newsModule.init();