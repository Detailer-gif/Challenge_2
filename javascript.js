var selectedFood=[];

//VUE Element for the right column (Seach for a beer by its name)
var searchBeerColumn=new Vue({

el:'#searchBeer',
data:{
    searchBeer_input:'',
    foods:[

    ],
    Tagline:null,
    ABV:null,
    IBU:null,
    EBC:null,
    but_visibility:'invisible',
    
    
},
methods:{
  //Poe as caixas de informação vazias
    resetParams:function(){
        this.foods=[];
        this.Tagline=null;
        this.ABV=null;
        this.IBU=null;
        this.EBC=null;
        this.but_visibility='invisible';
        this.searchBeer_input='';
    },
  //Procede ao preenchimento das caixas com informação da cerveja e ativa o butão para mais informações
    fillInfo:function(){
        this.foods=[];
        this.searchBeer_input=selectedFood.name;
        this.Tagline=selectedFood.tagline;
        this.ABV=selectedFood.abv;
        this.IBU=selectedFood.ibu;
        this.EBC=selectedFood.ebc;
        this.but_visibility='visible';
        for(let i=0;i<selectedFood.food_pairing.length;i++){
          let entry=[{name:selectedFood.food_pairing[i]}];
          this.foods=this.foods.concat(entry);
        }

    },
  //Faz o pedido HTTP para saber informações da cerveja digitada
    api_request_beer:function(beername){
      let httpUrl="https://api.punkapi.com/v2/beers?beer_name="+beername;
        
      let xhr=new XMLHttpRequest();
      xhr.open("GET",new URL(httpUrl),true);
      xhr.send();
      xhr.onload = function() {
          if (xhr.status != 200) { // analyze HTTP status of the response
            alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
          } else { // show the result
            let resp=JSON.parse(xhr.response);
            if(resp.length===0){
                  alert("Beer not found");
                  searchBeerColumn.resetParams();
            }
            else{
                 selectedFood=resp[0];
                 searchBeerColumn.fillInfo();
                 
                  
            }
          }
        };
    },
  //Ve se o utilizador inseriu alguma cerveja e caso sim chama a função que faz o pedido HTTP  
    sub_searchBeer:function(event){
      console.log(this.searchBeer_input);
        if( this.searchBeer_input.length==0){
          alert("Insert a beer please");
          this.resetParams();
        }
        else{
        let beername=this.searchBeer_input.replace(" ","_");
        this.api_request_beer(beername);
        
        }
    },
  
  //Abre o modal com informações mais especifícas da cerveja
    modalOpen:function(event){
      
        modalEvery.displayInfo(selectedFood);
    },

    
}




});


var table_food=[];
var separador='\n'+'-----------------------'+'\n';
//VUE Element for the middle column (Search for all beers that match a certain food)
var searchFoodColumn=new Vue({

el:'#searchFood',
data:{
  searchFood_input:'',
  rows:[],
  pagina_food:1,
  foodname:null,

},

methods:{
  resetParams:function(){
      this.rows=[];
      this.pagina_food=1;
      this.searchFood_input='';
  },
  atualizarTabela_food:function(food_temp){
      this.rows=[];
      this.foodname=food_temp;
      this.searchFood_input=this.foodname;

      for(let i=0;i<table_food.length;i++){
        //Create the food array
        let food_array=table_food[i].food_pairing;
        let food_output="";
        for(let j=0;j<food_array.length;j++){
            food_output=food_output.concat(''+food_array[j]+separador);
        }
        //Create an entry row
        
         let new_id=i+(this.pagina_food-1)*10;
      
        let entry=[{id:new_id,beer_name:table_food[i].name,food:food_output}];
        this.rows=this.rows.concat(entry);
      }
  }  ,
  api_request_food:function(foodname){
      let httpUrl="https://api.punkapi.com/v2/beers?page="+this.pagina_food+"&per_page=10&"+"food="+foodname;
    
    let xhr=new XMLHttpRequest();
        xhr.open("GET",new URL(httpUrl),true);
        xhr.send();
        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
              alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result
              let resp=JSON.parse(xhr.response);
              if(resp.length===0){
                    //searchBeerColumn.status="NOT FOUND";
                    
                      //alert('Not found any food-beer matching');
                      searchFoodColumn.resetParams();


                    
              }
              else{
                    
                    //searchBeerColumn.status="FOUND";

                  //CRIAR TABELA
                  
                  table_food=resp;
                  
                  
                  searchFoodColumn.atualizarTabela_food(foodname);
                  

              }
            }
          };
  },
  sub_searchFood:function(event){
    this.pagina_food=1;
    if( this.searchFood_input.length==0 ){
      alert("Insert a matching food");
      this.rows=[];
      
    }
    else{
      let food_temp=this.searchFood_input.replace(" ","_");
      
      this.api_request_food(food_temp);
    }

  }  ,
//atualiza a tabela incrementado o parametro 'page' do url
  nextpage_food:function(event){
      this.pagina_food++;
      this.api_request_food(this.foodname);
  },

  prevpage_food:function(event){
      if(this.pagina_food===1){
        this.api_request_food(this.foodname);
      }
      else{
        this.pagina_food--;
        this.api_request_food(this.foodname);
      }
  },
//caso o utilizado clique em cima de uma linha aparece o modal com mais informações acerca da cerveja
  selectedrow_food:function(event){
    
    let id=parseInt(event.target.parentElement.children[0].innerHTML);
    let array_id=id-(this.pagina_food-1)*10;
    console.log(array_id);
    modalEvery.displayInfo(table_food[array_id]);
  },
      },
  
 
    
});

var table_brewed=[];
//VUE Element for the right column (Search for all beers brewed before a certain date)
var searchBrewedColumn=new Vue({
  el:"#searchBrewed",
  data:{
    searchBrewed_input:'',
    pagina_brewed:1,
    rows:[],
    date_brewed:null,
  },
  methods:{
    atualizarTabela_brewed:function(){
      this.rows=[];
      for(let i=0;i<table_brewed.length;i++){
        
          let new_id=i+(this.pagina_brewed-1)*10;
        
        
        let entry=[{id:new_id,beer_name:table_brewed[i].name,firstBrewed:table_brewed[i].first_brewed}];
        this.rows=this.rows.concat(entry);
      }
    },
    sub_searchBrewed:function(){
      
      if( this.searchBrewed_input.length==0){
            this.rows=[];
            alert("Insert a valid date");
            this.pagina_brewed=1;
      }
      else{
      let date_aux=this.searchBrewed_input.split('-');
      this.date_brewed=''+date_aux[1]+'-'+date_aux[0];

      this.api_request_brewed(this.date_brewed);
      }
    },
    api_request_brewed:function(date){
      let httpUrl="https://api.punkapi.com/v2/beers?page="+this.pagina_brewed+"&per_page=10&"+"&brewed_before="+date;
    
      let xhr=new XMLHttpRequest();
          xhr.open("GET",new URL(httpUrl),true);
          xhr.send();
          xhr.onload = function() {
              if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
              } else { // show the result
                let resp=JSON.parse(xhr.response);
                if(resp.length===0){
                      //searchBeerColumn.status="NOT FOUND";
                    
                }
                else{
                      
                      //searchBeerColumn.status="FOUND";
  
                    //CRIAR TABELA
                    
                    table_brewed=resp;
                    
                    
                    searchBrewedColumn.atualizarTabela_brewed();
                    
  
                }
              }
            };
    },
    nextpage_brewed:function(event){
      this.pagina_brewed++;
      this.api_request_brewed(this.date_brewed);
    },
    prevpage_brewed:function(event){
      if(this.pagina_brewed===1){

      }
      else{
        this.pagina_brewed--;
        this.api_request_brewed(this.date_brewed);
      }
    },
    selectedrow_brewed:function(){
      let id=parseInt(event.target.parentElement.children[0].innerHTML);
      let array_id=id-(this.pagina_brewed-1)*10;
      console.log(array_id);
      modalEvery.displayInfo(table_brewed[array_id]);
    },

  }
})

var modalEvery=new Vue({
  el:"#modal1",
  data:{
      Beer_Name:null,
      Tagline:null,
      Description:null,
      F_Brewed:null,
      Brew_Tips:null,
      Volume:null,
      pH:null,
      Ferm_Temp:null,
      Ferm_Duration:null,
      Mash_Temp:null,
      Mash_Duration:null,
      hops:[],
      malts:[],
      yeast_name:null,
      ABV:null,
      IBU:null,
      EBC:null,
      foods:[],
  },
  methods:{
      displayInfo:function(beer){
          console.log(beer);
          this.Beer_Name=beer.name;
          this.Tagline=beer.tagline;
          this.Description=beer.description;
          this.F_Brewed=beer.first_brewed;
          this.Brew_Tips=beer.brewers_tips;
          this.Volume=''+beer.volume.value+' ' +beer.volume.unit;
          this.pH=beer.ph;
          this.ABV=beer.abv;
          this.IBU=beer.ibu;
          this.EBC=beer.ebc;
          this.Ferm_Temp=beer.method.fermentation.temp.value;
          this.Ferm_Duration='-';
          this.Mash_Temp=beer.method.mash_temp[0].temp.value;
          this.Mash_Duration=beer.method.mash_temp[0].duration;
          this.fill_hops(beer.ingredients.hops);
          this.fill_malts(beer.ingredients.malt);
          this.yeast_name=beer.ingredients.yeast;
          for(let i=0;i<beer.food_pairing.length;i++){
            let entry=[{name:beer.food_pairing[i]}];
            this.foods=this.foods.concat(entry);
          }
      },
      fill_hops:function(hops){
        this.hops=[];
        for(let i=0;i<hops.length;i++){
          let entry=[{name:hops[i].name,amount:hops[i].amount.value,add:hops[i].add,attribute:hops[i].attribute}];
          this.hops=this.hops.concat(entry);
        }

      },
      fill_malts:function(malts){
        this.malts=[];
        for(let i=0;i<malts.length;i++){
          let entry=[{name:malts[i].name,amount:malts[i].amount.value}];
          this.malts=this.malts.concat(entry);
        }
      },
  }
})





