// API Base URL - the server address
const BASE_URL = 'http://localhost:8080';

// Default HTTP headers for requests to the api
const HTTP_REQ_HEADERS = new Headers({
  "Accept": "application/json",
  "Content-Type": "application/json"
});

// Used to Initialise GET requests and permit cross origin requests
const GET_INIT = {
  method: 'GET',
  credentials: 'include',
  headers: HTTP_REQ_HEADERS,
  mode: 'cors',
  cache: 'default'
};


// Asynchronous Function getDataAsync from a url and return
// The init paramter defaults to GET_INIT
let getDataAsync = async (url, init = GET_INIT) => {
  // Try catch 
  try {
    // Call fetch and await the respose
    // Initally returns a promise
    const response = await fetch(url, init);

    // As Resonse is dependant on the fetch call, await must also be used here
    const json = await response.json();

    // Output result to console (for testing purposes) 
    console.log(json);

    // Call function( passing the json result) to display data in HTML page
    //displayData(json);
    return json;

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }
} // End function

// 1. Parse JSON
// 2. Create product rows
// 3. Display in web page
let displayProducts = ((products) => {
  // Use the Array map method to iterate through the array of products (in json format)

  const rows = products.map(product => {
    // returns a template string for each product, values are inserted using ${ }
    // <tr> is a table row and <td> a table division represents a column
    // product_price is converted to a Number value and displayed with two decimal places
    let row = `<tr>
                <td>${product._id}</td>
                <td>${product.product_name}</td>
                <td>${product.product_description}</td>
                <td>${product.product_stock}</td>
                <td class="price">&euro;${Number(product.product_price).toFixed(2)}</td>

                <td><button class="btn btn-sm btn-outline-primary"
                  data-bs-toggle="modal" data-bs-target="#ProductFormDialog" 
                  onclick="prepareProductUpdate('${product._id}')">
                  <span class="bi bi-pencil-square" 
                  data-toggle="tooltip" title="Edit Product">
                  </span></button>
                </td>

                <td><button class="btn btn-sm btn-outline-danger" 
                  onclick="deleteProduct('${product._id}')">
                  <span class="bi bi-trash" data-toggle="tooltip" 
                    title="Delete Product"></span></button>
                </td>

              </tr>`;

    return row;
  });
  // Set the innerHTML of the productRows root element = rows
  // join('') converts the rows array to a string, replacing the ',' delimiter with '' (blank)
  document.getElementById('productRows').innerHTML = rows.join('');
}); // end function

// Display categories
// 
let displayCategories = ((categories) => {
  // use Array.map() to iterate through the list of categories
  // Returns an HTML link for each category in the array
  const catLinks = categories.map(category => {
    // The link has an onclick handler
    // updateProductsView(id)
    // passing the category id as a parameter
    return `<a href="#" 
      class="list-group-item list-group-item-action" 
      onclick="updateProductsView('${category._id}')">
      ${category.category_name}</a>`;
  });

  // use  unshift to add a 'Show all' link at the start of the array of catLinks
  catLinks.unshift(`<a href="#" 
    class="list-group-item list-group-item-action" 
    onclick="loadProducts()">Show all</a>`);

  // Set the innerHTML of the productRows element = the links contained in catlinks
  // .join('') converts an array to a string, replacing the , seperator with blank.
  document.getElementById('categoryList').innerHTML = catLinks.join('');

  //
  // *** Fill select list in product form ***
  // first get the select input by its id
  let catSelect = document.getElementById("category_id");

  // clear any exist options
  while (catSelect.firstChild)
    catSelect.removeChild(catSelect.firstChild);

  // Add an option for each category
  // iterate through categories adding each to the end of the options list
  // each option is made from categoryName, categoryId
  // Start with default option
  catSelect.add(new Option("Choose a category", "0"))
  for (let i = 0; i < categories.length; i++) {
    catSelect.add(new Option(categories[i].category_name, categories[i]._id));
  }

}); // End function displayCategories()

// update products list when category is selected to show only products from that category
let updateProductsView = (async (id) => {
  try {
    // call the API enpoint which retrieves products by category (id)
    const products = await getDataAsync(`${BASE_URL}/product/bycat/${id}`);
    // Display the list of products returned by the API
    displayProducts(products);

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}); // End function 

//
// Get values from product form
// Create new Product and return
let getProductForm = () => {
  // new Product object constructed from the form values
  // Note: These should be validated!!
  return new Product(
    // read the form values and pass to the Product constructor
    document.getElementById('_id').value,
    document.getElementById('category_id').value,
    document.getElementById('product_name').value,
    document.getElementById('product_description').value,
    document.getElementById('product_stock').value,
    document.getElementById('product_price').value,
  );
} // End function


//
// Setup product form
function productFormSetup(title) {
  // reset the form and change the title
  document.getElementById('productForm').reset();
  document.getElementById('productFormTitle').innerHTML = title;

  // form reset doesn't work for hidden inputs!!
  // do this to rreset previous id if set
  document.getElementById("_id").value = 0;
} // End function


//
// When a product is selected for update/ editing
// get by id and fill out the form
async function prepareProductUpdate(id) {
  try {
    // 1. Get broduct by id
    const product = await getDataAsync(`${BASE_URL}/product/${id}`);
    // 2. Set form defaults
    productFormSetup(`Update Product ID: ${product._id}`);

    // 3. Fill out the form
    document.getElementById('_id').value = product._id; // uses a hidden field - see the form
    document.getElementById('category_id').value = product.category_id;
    document.getElementById('product_name').value = product.product_name;
    document.getElementById('product_description').value = product.product_description;
    document.getElementById('product_stock').value = product.product_stock;
    document.getElementById('product_price').value = product.product_price;

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
}

//
// Called when add product form is submitted
let addOrUpdateProduct = async () => {

  // url for api call
  const url = `${BASE_URL}/product`
  // New product = POST, Update = PUT or PATCH
  let httpMethod = 'POST';

  // Get the form data
  const formProduct = getProductForm();
  // log to console
  console.log('%cNew Product: ', 'color: green', formProduct);

  // Check if new product or update
  // Only existing products have formProduct._id > 0
  if (formProduct._id > 0) {
    httpMethod = 'PUT';
  }

  // build the request object - note: POST
  // reqBodyJson added to the req body
  const request = {
    method: httpMethod,
    headers: HTTP_REQ_HEADERS,
    credentials: 'include',
    mode: 'cors',
    // convert JS Object to JSON and add to request body
    body: JSON.stringify(formProduct)
  };

  try {
    // Call fetch and await the respose
    // fetch url using request object
    const response = await fetch(url, request);
    const json = await response.json();

    // Output result to console (for testing purposes) 
    console.log(json);

    // catch and log any errors
  } catch (err) {
    console.log(err);
    return err;
  }

  // Refresh products list
  loadProducts();
} // End function

//
// Get all categories and products then display
let loadProducts = async () => {
  try {

    // get category data - note only one parameter in function call
    const categories = await getDataAsync(`${BASE_URL}/category`);
    //pass json data for display
    displayCategories(categories);

    // get products data - note only one parameter in function call
    const products = await getDataAsync(`${BASE_URL}/product`);
    //pass json data for display
    displayProducts(products);

  } // catch and log any errors
  catch (err) {
    console.log(err);
  }
} // End function 

// Delete product by id using an HTTP DELETE request
async function deleteProduct(id) {
  // url for delete product endpoint
  const url = `${BASE_URL}/product/${id}`;

  // Build the request object
  const request = {
    method: 'DELETE',
    headers: HTTP_REQ_HEADERS,
    credentials: 'include',
    mode: 'cors',
  };

  // Confirm delete
  if (confirm("Are you sure?")) {
    try {
      // call the api and get a result
      const result = await fetch(url, request);
      const response = await result.json();

      if (response == true)
        // if success (true result), refresh products list
        loadProducts();

      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  }
} // End Function

// When this script is loaded, get things started by calling loadProducts()
loadProducts();