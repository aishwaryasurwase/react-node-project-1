
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null
    }

  }

  onChangeHandler = event => {
    // console.log(event.target.files[0]);
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
  }

  onClickHandler = () => {
    const data = new FormData();
    data.append('file', this.state.selectedFile);
    // console.log("DATA ", data);

    let fileName = document.querySelector('#csvFile').value;
    let extension = fileName.split('.').pop();
    // console.log("extension", extension);

    if (extension == 'csv') {
      axios.post("http://localhost:3100/uploadFile", data, {
      })
      .then(res => {
          console.log(res.statusText);
          alert('Data imported into database successfully');
      }).catch(err=>{
        alert("Error in imported data into database.");
      })
      
    } else {
      alert("Please select .CSV extension file");
    }
  }
  render() {

    return (
      <div class="container mt-5">
        <h3> Wecolme to the Nibodh Educare Private Limited </h3>
        <hr></hr>
        <div class="form-group" className="files">
          <label>Upload your file</label> <br></br>
          <input type="file" name="file" id="csvFile" onChange={this.onChangeHandler} />
          <button type="button" class="btn btn-success" onClick={this.onClickHandler}>Upload</button>
        </div>
      </div>
    );
  }
}

export default App;
