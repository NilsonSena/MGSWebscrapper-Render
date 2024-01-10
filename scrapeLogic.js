const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    const mainUrl = 'https://www.mgs.srv.br/processo-seletivo-convocacao/info/processo-seletivo-publico-simplificado-2-2023/77';
    
    await page.goto(mainUrl);

    // Aguarda a página carregar
    await page.waitForSelector('select[name="ddl_cdCargo"]');

    const elementoSelect = await page.$('select[name="ddl_cdCargo"]');
    await elementoSelect.select('557');

    // Aguarde um momento para que a seleção seja processada (se necessário)
    await page.waitForTimeout(3000);
    
    const cidadeSelect = await page.$('select[name="ddl_cdLocalidade"]');
    await cidadeSelect.select('613');

    await page.waitForTimeout(2000);

    await page.click('input[name="bt_localizar"]');

    await page.waitForTimeout(2000);

    const elementosTd = await page.$$('td');

    let encontrouNove = false;
    let contadorTd = 0;
    var conteudosTD = [];
    var conteudosTD2 = [];
    var logStatement = [];
    var logStatement2;
    var combina;

    for (const td of elementosTd) {
      const textoTd = await page.evaluate(element => element.textContent.trim(), td);

      if (textoTd === '9') {
        encontrouNove = true;
        contadorTd = 1; 
      } else if (encontrouNove) {
        contadorTd++;

        if (contadorTd === 2) {
          conteudosTD.push(textoTd);  
            
        }else if(contadorTd === 4){
          conteudosTD.push(textoTd);
          break; 
        }
        
      }
    }
    for(x = 1; x<16; x++){

    
      for (const td of elementosTd) {
        
        const textoTd = await page.evaluate(element => element.textContent.trim(), td);

          if (textoTd == x) {
            encontrouNove = true;
            contadorTd = 1; 

          } else if (encontrouNove) {
            contadorTd++;

            if (contadorTd === 2) {
              conteudosTD2.push(textoTd);  
                
            }else if(contadorTd === 4){
              conteudosTD2.push(textoTd);
              break;

            }
            
          }
      }
    }
    var i = 0;
      for (y = 0; y < 16; y+= 2){
        i++;

        //console.log(y);
        if (encontrouNove) {
          if(conteudosTD2[y + 1] === 'Em aberto'){
            logStatement.push("O " + i + "º candidato " + conteudosTD2[y] + " ainda não foi chamado!");
            //console.log("O primeiro candidato "+ conteudosTD2[0] +" ainda não foi chamado!");
          }else{
            logStatement.push("O " + i + "º candidato " + conteudosTD2[y] + " foi chamado!");
            //console.log("O primeiro candidato foi chamado!");
          }
        
          if(conteudosTD[1] === 'Em aberto'){
            logStatement2 = "Eu (" + conteudosTD[0] + ") ainda não fui chamado!";
            //console.log("Eu (" + conteudosTD[0] + ") ainda não fui chamado!");
          }else{
            logStatement2 = "Parabéns " + conteudosTD[0] + "! Fui chamado!";
            //console.log("Parabéns "+ conteudosTD[0]+ "! Fui chamado!");
          }
            
        } else {
          logStatement.push("O TD requerido não foi encontrado na página.");
          //console.log('O TD requerido não foi encontrado na página.');
        }
        
      //combina = logStatement +'\n'+ logStatement2;
      //console.log(combina);
      //res.send(combina);
      
    }
    var arrayQuebraLinha = logStatement.join('</br> \n');
    console.log(arrayQuebraLinha);
    res.send(`${arrayQuebraLinha}</br>${logStatement2}`);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
