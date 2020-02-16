// Create needed constants
const list = document.querySelector('ul')
const listInner = list.innerHTML
const titleInput = document.querySelector('#title')
const bodyInput = document.querySelector('#body')
const form = document.querySelector('form')
const submitBtn = document.querySelector('form button')

// Create var for storing object
let db

window.onload = function() {
	// Open our db, if it doesn't exist, it will create automatically
	let request = window.indexedDB.open('notes_db', 1)

	// Setup the database tables if this has not already been done
	request.onupgradeneeded = function(e) {
		// Grab a reference to the opened db
		let db = e.target.result

		// Create object to store our note
		let objectStore = db.createObjectStore('notes_os', {keyPath: 'id', autoIncrement: true})

		// Define data to store
		objectStore.createIndex('title', 'title', {unique: false})
		objectStore.createIndex('body', 'body', {unique: false})

		console.log('Database setup complete!')
	}

	request.onerror = function() {
		console.error('Failed to open Database!')
	}

	request.onsuccess = function() {
		console.log('Database opened!')

		db = request.result
		displayData()
	}

	form.onsubmit = addData	
}

function addData(e) {
	e.preventDefault()

	let newItem = {title: titleInput.value, body: bodyInput.value}

	// open read/write db transaction, ready for adding data
	let transaction = db.transaction(['notes_os'], 'readwrite')

	// call object that already added
	let objectStore = transaction.objectStore('notes_os')

	let request = objectStore.add(newItem)
	request.onsuccess = function() {
		titleInput.value = ''
		bodyInput.value = ''
	}

	// when everything is done
	request.oncomplete = function() {
		console.log('Transaction completed!')
		displayData()
	}
}

function displayData() {
	
	while(listInner.firstChild) {
		list.removeChild(listInner.firstChild)
	}

	let objectStore = db.transaction('notes_os').objectStore('notes_os')
	// with openCursor, it will iterate throught all each item in object store
	objectStore.openCursor().onsuccess = function(e) {
		let	cursor = e.target.result

		// If there is still another data item to iterate through, keep running this code
		if(cursor) {
			const listItem = document.createElement('li')
		      const h3 = document.createElement('h3')
		      const para = document.createElement('p')

		      listItem.appendChild(h3)
		      listItem.appendChild(para)
		      list.appendChild(listItem)

		      // Put the data from the cursor inside the h3 and para
		      h3.textContent = cursor.value.title
		      para.textContent = cursor.value.body

		      // Store id in each li
		      listItem.setAttribute('data-note-id', cursor.value.id)

		      // create delete button
		      const deleteBtn = document.createElement('button')
		      listItem.appendChild(deleteBtn)
		      deleteBtn.textContent = 'Delete'

		      // Set an event handler so that when the button is clicked, the deleteItem()
      		  // function is run
      		  deleteBtn.onclick = deleteItem

      		  // Iterate to the next item
      		  cursor.continue()
		}	
		else {
			// If list empty, display note empty
			if(!listInner.firstChild) {

				const lisItem = document.createElement('li')
				lisItem.textContent = 'No note stored.'
				list.appendChild(lisItem)
			}
			console.log('Notes all displayed')
		}
	}
}

function deleteItem(e) {
	let noteId = e.target.parentNode.getAttribute('data-note-id')

	// Open DB
	let transaction = db.transaction(['notes_os'], 'readwrite')
	let objectStore = transaction.objectStore('notes_os')
	let request = objectStore.delete(noteId)

	request.oncomplete = function() {
		// remove note id
		e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    	console.log('Note ' + noteId + ' deleted.');

    	if(!listInner.firstChild) {
 			const lisItem = document.createElement('li')
			lisItem.textContent = 'No note stored.'
			list.appendChild(lisItem)   		
    	}
	}
}