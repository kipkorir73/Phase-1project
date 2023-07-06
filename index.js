document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('sss');
  searchInput.addEventListener('input', handleSearch);

  let allTitlesData = [];

  const topPicksIds = [1, 6, 11, 17, 25, 30, 35, 40];
  const topPicksPromises = topPicksIds.map(id =>
    fetch(`http://localhost:3000/books/${id}`)
      .then(response => response.json())
  );

  const allTitlesPromise = fetch('http://localhost:3000/books')
    .then(response => response.json())
    .then(data => {
      allTitlesData = data;
      return data;
    });

  Promise.all([Promise.all(topPicksPromises), allTitlesPromise])
    .then(([topPicksData, allTitlesData]) => {
      displayTopPicks(topPicksData);
      displayAllTitles(allTitlesData);
    })
    .catch(error => console.log(error));

  function displayTopPicks(books) {
    const topPicksContainer = document.getElementById('topPicksContainer');
    topPicksContainer.innerHTML = '';

    books.forEach(book => {
      const card = createBookCard(book);
      topPicksContainer.appendChild(card);
    });
  }

  function displayAllTitles(books) {
    const allTitlesContainer = document.getElementById('allTitlesContainer');
    allTitlesContainer.innerHTML = '';

    books.forEach(book => {
      const card = createBookCard(book);
      allTitlesContainer.appendChild(card);
    });
  }

  function createBookCard(book) {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = book.posterUrl;
    img.alt = 'Book poster';
    card.appendChild(img);

    const title = document.createElement('h2');
    title.textContent = book.title;
    card.appendChild(title);

    const author = document.createElement('p');
    author.textContent = book.author;
    card.appendChild(author);

    const description = document.createElement('p');
    description.textContent = book.description;
    card.appendChild(description);

    const price = document.createElement('p');
    price.textContent = `Price: $${book.price}`;
    card.appendChild(price);

    const addToCartButton = document.createElement('button');
    if (book.sold >= book.capacity) {
      addToCartButton.textContent = 'SOLD OUT';
      addToCartButton.disabled = true;
    } else {
      addToCartButton.textContent = 'Add to Cart';
      addToCartButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (book.sold < book.capacity) {
          fetch(`http://localhost:3000/books/${book.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sold: book.sold + 1 }),
          })
            .then(response => response.json())
            .then(updatedBook => {
              book.sold = updatedBook.sold;
              addToCartButton.disabled = book.sold >= book.capacity;
              if (book.sold >= book.capacity) {
                addToCartButton.textContent = 'SOLD OUT';
              }
            })
            .catch(error => console.log(error));
        }
      });
    }
    card.appendChild(addToCartButton);

    return card;
  }

  function handleSearch(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.toLowerCase();
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    searchResultsContainer.classList.add('flex-container');

    searchResultsContainer.innerHTML = '';

    if (searchTerm === '') {
      return;
    }

    const matchingBooks = allTitlesData.filter(book =>
      book.title.toLowerCase().includes(searchTerm)
    );

    matchingBooks.forEach(book => {
      const card = createBookCard(book);
      searchResultsContainer.appendChild(card);
    });
  }
});

