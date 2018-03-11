/*
  @author Félix Fuin
  Copyright Nokia 2018. All rights reserved.
*/
import React, { Component } from 'react';
import {Input, Grid, Menu, Dropdown} from 'semantic-ui-react';

import '../css/Browse.css';
import Line from './Line';
import dataLibrary from '../dataLibrary';
import MdClear from 'react-icons/lib/md/clear';
import userLibrary from '../userLibrary';
import Categories from '../lib/categories.js';

export default class Browse extends Component {
    state = { isLoading:true, countCategories: [], sortActive: 'All', data:[], displayedData: [], searchValue: "", filterCategory: "All topics" }
    componentWillMount(){
        this.searchClear = this.searchClear.bind(this);
        this.initDropdown = this.initDropdown.bind(this);
        let data = dataLibrary.get();
        data.then((result) =>{
            this.setState({data: result, displayedData: result});
            this.props.onLoaded(true);
            let countQuery = dataLibrary.countCategories();
            countQuery.then((result) =>{
                this.setState({countCategories: result});
                this.initDropdown(this.state.filterCategory);
                this.setState({isLoading:false});
            });
        });
        userLibrary.getCurrentUser().then((result) => {
            this.user = result;
        });
    }

    dropDownOptions = [];
    initDropdown(act){
        this.dropDownOptions = [
            <Dropdown.Item key="All" value='All topics' active={act === "All topics" ? true : false} onClick={this.handleCategoryClick.bind(this)}>All topics ({this.state.countCategories['all']})</Dropdown.Item>,
            <Dropdown.Item key="My" value='My topics' active={act === "My topics" ? true : false} onClick={this.handleCategoryClick.bind(this)}>My topics ({this.state.countCategories['my']})</Dropdown.Item>,
            <Dropdown.Item key="Unclassified" value='Unclassified' active={act === "Unclassified" ? true : false} onClick={this.handleCategoryClick.bind(this)}>Unclassified ({this.state.countCategories['unclassified']})</Dropdown.Item>
        ];
        Categories.forEach( category => {
            let count = 0;
            let countSubTotal = 0;
            if(Array.isArray(category)){

                let subCategories = [];
                category[1].forEach( subCategory => {
                    count = this.state.countCategories[subCategory];
                    countSubTotal += count;
                    subCategories.push(
                        <Dropdown.Item key={subCategory} value={subCategory} active={act === subCategory ? true : false} onClick={this.handleCategoryClick.bind(this)}>{subCategory} ({count})</Dropdown.Item>
                    );
                });
                let subText = category[0] + " (" + countSubTotal.toString() + ")";
                this.dropDownOptions.push(
                    <Dropdown.Item className="subcategories">
                        <Dropdown pointing='left' text={subText}>
                            <Dropdown.Menu>
                                {subCategories}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Dropdown.Item>
                );
            }else{
                
                count = this.state.countCategories[category];
                this.dropDownOptions.push(
                    <Dropdown.Item 
                        value={category} 
                        key={category}
                        active={act === category ? true : false} 
                        onClick={this.handleCategoryClick.bind(this)}
                    >{category} ({count}) </Dropdown.Item>
                );
            }
        });
    }
    searchClear(){
        this.search("");
    }

    handleCategoryClick(e, data){     
        this.setState({ filterCategory: data.value, searchValue: "", sortActive: "All" });
        this.initDropdown(data.value);
        if(data.value === "All topics"){
            this.setState({ displayedData: this.state.data });
        }else if(data.value === "My topics"){
            let tmp = [];
            for (var i=0; i < this.state.data.length; i++) {
                if (this.state.data[i].User === this.user.ID) {
                    tmp.push(this.state.data[i]);
                }
            }
            this.setState({displayedData: tmp});
        }else{
            let tmp = [];
            for (var y=0; y < this.state.data.length; y++) {
                if (this.state.data[y].Category.toLowerCase().indexOf(data.value.toLowerCase()) !== -1) {
                    tmp.push(this.state.data[y]);
                }
            }
            this.setState({displayedData: tmp});
        }
    }

    handleSortClick = (e, { name }) => {
        this.setState({ filterCategory: "All topics", sortActive: name, searchValue: "" });
        if(name === "All"){
            this.setState({ displayedData: this.state.data });
        }else{
            let tmp = [];
            this.state.data.forEach( item => {
                if(item.Type.toLowerCase() === name.toLowerCase()){
                    tmp.push(item);
                }
            });
            this.setState({displayedData: tmp});
        }
    }

    search = (event) => {
        let val;
        if(event === ""){
            val = event;
        }else{
            val = event.target.value;
        }
        this.setState({ filterCategory: "All topics", searchValue: val, sortActive: "All" });
        let tmp = [];
        for (var i=0; i < this.state.data.length; i++) {
            if (this.state.data[i].Title.toLowerCase().indexOf(val.toLowerCase()) !== -1) {
                tmp.push(this.state.data[i]);
            }
        }
        this.setState({displayedData: tmp});
    }

    render() {
       if (this.state.isLoading) {
            return (
                <div className="browse"></div>
            );
        }else{
            const { sortActive } = this.state;
            let lines;
            if(this.state.displayedData.length > 0){
                lines = this.state.displayedData.map( (line, index) => {
                    return(
                        <div key={index}><Line data={line}/></div>
                    )
                });
            }else{
                lines = (
                    <div className="nothing">Nothing for the moment...</div>
                )
            }

            return (
                <div className="browse">
                    <div className="banner">
                        <div className="wrapper">
                            <div className="bannerTitle">
                                Browse topics
                            </div>
                            <Input 
                                value={this.state.searchValue}
                                className="bannerSearch" 
                                icon='search' 
                                placeholder='Search...'
                                onChange={this.search} 
                            />
                            {this.state.searchValue ? ( 
                                <span className="searchClear" onClick={this.searchClear}><MdClear /></span>
                            ) : null}
                        </div>
                    </div>
                    <div className="wrapper">
                        <Grid columns='equal' container className="menuSortFilter">
                            <Grid.Row>
                                <Grid.Column>
                                    <Dropdown
                                        button
                                        className='icon filter'
                                        floating
                                        labeled
                                        icon='tags'
                                        text={this.state.filterCategory}
                                    >
                                        <Dropdown.Menu>
                                            {this.dropDownOptions}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Grid.Column>
                                <Grid.Column >
                                    <Menu secondary className="menuSort">
                                        <Menu.Menu position='right'>
                                            <Menu.Item name='All' active={sortActive === 'All'} onClick={this.handleSortClick} />
                                            <Menu.Item name='Request' active={sortActive === 'Request'} onClick={this.handleSortClick} />
                                            <Menu.Item name='Share' active={sortActive === 'Share'} onClick={this.handleSortClick} />
                                        </Menu.Menu>
                                    </Menu>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        {lines}
                    </div>
                </div>                        
            );
        }
    }
}