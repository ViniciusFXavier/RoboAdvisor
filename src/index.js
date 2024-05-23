const {
    GoogleGenerativeAI,
    FunctionDeclarationsTool,
    FunctionDeclarationSchemaType,
    HarmCategory,
    HarmBlockThreshold
  } = require("@google/generative-ai");
  
  const run = async () => {
    const API_KEY = "AIzaSyCHDTSHuIAk80kp5I6AbT0eDy1nusFNFIk"; // Chave Desativada =D
    const genAI = new GoogleGenerativeAI(API_KEY);
  
    const functions = {
      simulatePrev: async ({ tipoDeclaracao, valorAposentadoria, valorInvestido, idadeAposentadoria, idadeAtual }) => {
        const tipoPlano = tipoDeclaracao === 'completa' ? 'PGBL' : 'VGBL'
        return {
          message: 'Recomendação de investimento',
          tipoPlano,
          tipoTributacao: 'Regressivo ',
          valorRescebidoAposentadoria: 'R$ 122.821,64'
        }
      }
    };
  
    // https://ai.google.dev/gemini-api/docs/function-calling#best-practices
    const tools = [
      {
        functionDeclarations: [
          {
            name: "simulatePrev",
            description: "Realiza simulação de Previdência privada.",
            parameters: {
              type: FunctionDeclarationSchemaType.OBJECT,
              properties: {
                tipoDeclaracao: {
                  type: FunctionDeclarationSchemaType.STRING,
                  description: "Tipo de Declaração de imposto de renda. Qual é o tipo de declaração a pessoa costuma fazer no seu Imposto de Renda? Ex.: 'completa' ou 'simplificada' ou 'não sabe'",
                },
                valorAposentadoria: {
                  type: FunctionDeclarationSchemaType.NUMBER,
                  description: "Valor que gostaria de receber por mês na aposentadoria. Quanto a pessoa gostaria de receber por mês na sua aposentadoria? Ex.: 3000, 200, 5000",
                },
                valorInvestido: {
                  type: FunctionDeclarationSchemaType.NUMBER,
                  description: "Valor que gostaria de receber por mês na aposentadoria. A pessoa já possui algum valor investido? Ex.: 0, 200, 5000, 600",
                },
                idadeAposentadoria: {
                  type: FunctionDeclarationSchemaType.NUMBER,
                  description: "Idade de aposentadoria. Com quantos anos a pessoa quer se aposentar? Mínimo de 50 e máximo de 115 Ex.: 65, 70, 80",
                },
                idadeAtual: {
                  type: FunctionDeclarationSchemaType.NUMBER,
                  description: "Idade Atual. Mínimo de 0 e máximo de 115 Ex.: 65, 70, 80",
                },
              },
              required: ['tipoDeclaracao', 'idadeAposentadoria', 'idadeAtual', 'valorInvestido'],
            },
          }
        ],
      },
    ]
  
    const generationConfig = {
      temperature: 0.5,
      maxOutputTokens: 256
    };
    const model = genAI.getGenerativeModel({
      // model: "gemini-1.5-pro-latest",
      // model: "models/gemini-1.5-pro-latest",
      model: "gemini-1.5-flash-latest",
      generationConfig,
      systemInstruction: `
      Você é um assessor de investimentos do BTG Pactual.
      Você é formal, objetivo e se comunica de forma clara e concisa, responda apenas com textos, não use emojis ou caracteres especiais, utilizando termos que seus clientes entendam.
      Sua função é ajudar os usuários a entenderem melhor as opções de previdência privada e auxiliá-los na tomada de decisão.
      Só pode recomendar o produtos da instituição financeira BTG Pactual.
  
      Conhecimento:
      No momento, seu conhecimento se limita a previdência privada. Você consegue diferenciar os tipos de declaração (completa ou simplificada) e como isso impacta o imposto de renda na previdência privada.
  
      Funcionalidade:
      Você tem acesso à função simulatePrev(tipoDeclaracao, valorAposentadoria, valorInvestido, idadeAposentadoria, idadeAtual), que retorna uma simulação de investimento em previdência privada.
      tipoDeclaracao: recebe o tipo de declaração de imposto de renda 'completa' ou 'simplificada' ou 'não sabe'
      valorAposentadoria: recebe o valor que a pessoa espera receber por mês
      valorInvestido: recebe o valor investido pela pessoa mensalmente
      idadeAposentadoria: recebe recebe a idade de aposentadoria desejável da pessoa
      idadeAtual: recebe a idade atual da pessoa
      Utilize a função simulatePrev para responder às perguntas dos usuários sobre previdência privada, fornecendo exemplos práticos e personalizados.
  
      Interação com o usuário:
      Esclareça as dúvidas dos usuários sobre previdência privada, como:
      Tipos de previdência privada (VGBL e PGBL).
      Diferença entre declaração completa e simplificada do imposto de renda.
      Vantagens e desvantagens da previdência privada.
      Ajude o usuário a entender qual tipo de declaração é mais vantajosa para seu caso, considerando sua renda anual.
  
      Utilize a função simulatePrev para mostrar exemplos práticos e personalizados, com base na declaração e renda anual informadas pelo usuário.
      Mantenha um tom neutro e informativo, sem induzir o usuário a tomar decisões precipitadas.
      Lembre-se de que você só pode recomendar o produtos da instituição financeira BTG Pactual.
  
      Exemplo de interação:
      input: "Olá meu nome é Vinícius"
      output: "Olá Vinícius! Para que eu possa te auxiliar da melhor forma com sua previdência privada, preciso de algumas informações. Por favor, responda:
      * Qual o tipo de declaração de imposto de renda você utiliza: completa ou simplificada? 
      * Qual valor você deseja receber mensalmente na aposentadoria?
      * Qual valor você pode investir mensalmente?
      * Qual a sua idade atual?
      * Com qual idade você pretende se aposentar?"
  
      input: "Qual a diferença entre PGBL e VGBL?"
      output: "Olá! O PGBL (Plano Gerador de Benefício Livre) e o VGBL (Vida Gerador de Benefício Livre) são tipos de previdência privada. A principal diferença entre eles está na forma como o imposto de renda incide. No PGBL, você pode deduzir as contribuições da sua base de cálculo do imposto de renda, caso utilize a declaração completa. Já no VGBL, essa dedução não é permitida. Para entender qual o plano mais indicado para você, preciso saber qual o tipo de declaração que você utiliza e qual a sua renda anual. Assim, posso te fazer uma simulação."
  
      * Responda apenas com texto.
      * Não use emojis ou caracteres especiais.
      `,
      // https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/configure-safety-attributes
      // safetySettings: [
      //   {
      //     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      //     threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      //   }
      // ]
    });
  
    const history = []
    const chat = await model.startChat({
      tools,
      history
    });
  
    const sendMessage = async (userText) => {
      console.log('-------------------------------');
      console.log('User Text: ', userText);
      const result = await chat.sendMessage(userText);
      const response = result.response;
  
      if (response.candidates.length === 0) {
        throw new Error("No candidates");
      }
  
      const output = []
      for (const candidate of response.candidates) {
        const content = candidate.content;
  
        if (!content || !content.parts) {
          output.push(response.text())
          continue
        }
  
        if (content.parts.length === 0) {
          throw new Error("No parts");
        }
  
        for (const part of content.parts) {
          console.log('part: ', part);
          const functionCall = part.functionCall;
          const text = part.text
  
          if (!functionCall) {
            output.push(text)
            continue
          }
  
          const { name, args } = functionCall;
          const fn = functions[name];
          if (!fn) {
            throw new Error(`Unknown function "${name}"`);
          }
  
          const functionResponse = {
            functionResponse: {
              name,
              response: {
                name,
                content: await functions[name](args),
              },
            }
          };
  
          await sendMessage([functionResponse]);
        }
      }
  
      return output
    }
  
    console.log('Ai response: ', await sendMessage('Olá meu nome é Vinícius'));
    console.log('Ai response: ', await sendMessage('Eu faço declaração de imposto de renda simplificada.'));
    console.log('Ai response: ', await sendMessage('Minha idade atual é 27'));
    console.log('Ai response: ', await sendMessage('Pretendo me aposentar com 65'));
    console.log('Ai response: ', await sendMessage('posso investir mensalmente entre 300 a 1000 reais'));
    console.log('Ai response: ', await sendMessage('gostaria de receber 1000 reais por mês'));
  }
  
  run()
  