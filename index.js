const { select, input, checkbox } = require('@inquirer/prompts') // Requisitando e prometendo
const fs = require("fs").promises

let mensagem = "Bem vindo ao App de Metas!";

let metas

const carregarMetas = async () => {
    try {
        const dados = await fs.readFile('metas.json', 'utf-8')
        metas = JSON.parse(dados)
    }
    catch(erro) {
        metas = []
    }
}

const salvarMetas = async () => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
    const meta = await input({ message: "Digite a meta:"})

    if(meta.length == 0) {
        mensagem = 'A meta não pode ser vazia.'
        return
    }

    metas.push({ 
        value: meta,
        checked: false
    })

    mensagem = "Meta cadastrada com sucesso!"
}

const listarMetas = async () => {
    if(metas.length ==0) {
        mensagem = "Nenhuma meta cadastrada."
        return
    }

    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o enter para finalizar essa etapa.",
        choices: [...metas],
        instructions: false,
    })

    metas.forEach((m) => { // Foi mudado a sequência para corrigir erro: (2 ou mais metas, após concluidas, serem desmarcadas. Uma das metas permanecia marcada.)
        m.checked = false
    })

    if(respostas.length == 0) {
        mensagem = "Nenhuma meta foi selecionada."
        return
    }

    respostas.forEach((resposta) => { // Pesquisar a meta na lista Metas
        const meta = metas.find((m) => {
            return m.value == resposta
        })

        meta.checked = true
    })

    mensagem = 'Meta(s) marcada(s) como concluída(s)'
}

const metasRealizadas = async () => {
    if(metas.length ==0) {
        mensagem = "Nenhuma meta cadastrada."
        return
    }

    const realizadas = metas.filter((meta) => {
        return meta.checked
    })

    if(realizadas.length == 0) {
        mensagem = 'Nenhuma meta foi concluída.'
        return
    }

    await select({
        message: "Metas Realizadas: " + realizadas.length,
        choices: [...realizadas]
    })
}

const metasAbertas = async () => {
    if(metas.length ==0) {
        mensagem = "Nenhuma meta cadastrada."
        return
    }

    const abertas = metas.filter((meta) => {
        return !meta.checked // ou != true
    })

    if(abertas.length == 0) {
        mensagem = "Não existem metas abertas!"
        return
    }

    await select({
        message: "Metas Abertas: " + abertas.length,
        choices: [...abertas]
    })
}

const removerMetas = async () => {
    if(metas.length ==0) {
        mensagem = "Nenhuma meta cadastrada."
        return
    }

    const metasDesmarcadas = metas.map((meta) => {  // o map vai sempre modificar o array original
        return {value: meta.value, checked: false}  // vai pegar o valor original e marcar o checked como false
    })
    const itemsADeletar = await checkbox({
        message: "Selecione uma tarefa para deletar.",
        choices: [...metasDesmarcadas],
        instructions: false,
    })

    if(itemsADeletar.length == 0) {
        mensagem = 'Nenhuma meta foi selecionada para ser deletada'
        return
    }

    itemsADeletar.forEach((item) => {
        metas = metas.filter((meta) => {
            return meta.value != item
        })
    })

    mensagem = "Meta(s) deleta(s) com sucesso!"
}

const mostrarMensagem = () => {
    console.clear();

    if(mensagem != "") {
        console.log(mensagem)
        console.log("")
        mensagem = ""
    }
}

const start = async () => {
    await carregarMetas()

    while(true){
        mostrarMensagem()
        // ou colocar aqui o await salvarMetas()

        const opcao = await select({ // Sempre que tiver await na function colocar async
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar meta",
                    value: "cadastrar"
                },
                {
                    name: "Listar metas",
                    value: "listar"
                },
                {
                    name: "Metas realizadas",
                    value: "realizadas"
                },
                {
                    name: "Metas abertas",
                    value: "abertas"
                },
                {
                    name: "Remover metas",
                    value: "remover"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })

        switch(opcao){
            case "cadastrar":
                await cadastrarMeta()
                await salvarMetas()
                break
            case "listar":
                await listarMetas()
                await salvarMetas()
                break
            case "realizadas":
                await metasRealizadas()
                break
            case "abertas":
                await metasAbertas()
                break
            case "remover":
                await removerMetas()
                await salvarMetas()
                break    
            case "sair":
                console.log("Até a próxima!")
                return
        }
    }
}

start()