const Main = {

  apiUrl: 'https://crudcrud.com/api/a88e05c19a8546d8bb5cff23068fa120/tasks',
  tasks: [],

  init: function() {
      this.cacheSelectors()
      this.bindEvents()
      this.getTasksFromAPI()
  },

  cacheSelectors: function() {
      this.$checkButtons = document.querySelectorAll('.check')
      this.$inputTask = document.querySelector('#inputTask')
      this.$list = document.querySelector('#list')
      this.$removeButtons = document.querySelectorAll('.remove')
  },

  bindEvents: function() {
      const self = this

      this.$checkButtons.forEach(function(button) {
          button.onclick = self.Events.checkButton_click.bind(self)
      })

      this.$inputTask.onkeypress = self.Events.inputTask_keypress.bind(this)

      this.$removeButtons.forEach(function(button) {
          button.onclick = self.Events.removeButton_click.bind(self)
      })
  },

  getTasksFromAPI: async function() {
      try {
          const response = await fetch(this.apiUrl)
          if (!response.ok) {
              throw new Error('Erro ao obter as tarefas da API')
          }
          const tasks = await response.json()
          this.tasks = tasks
          this.buildTasks()
      } catch (error) {
          console.error('Erro ao obter as tarefas da API:', error)
      }
  },

  getTaskHtml: function(task, id) {
      return `
          <li data-task="${task}" data-id="${id}">          
              <div class="check"></div>
              <label class="task editable">
                  ${task}
              </label>
              <button class="remove"></button>
          </li>
      `
  },

  insertHTML: function(element, htmlString) {
      element.innerHTML += htmlString
      this.cacheSelectors()
      this.bindEvents()
  },

  buildTasks: function() {
      let html = ''

      this.tasks.forEach(item => {
          html += this.getTaskHtml(item.task, item._id)
      })

      this.insertHTML(this.$list, html)
  },

  Events: {
      checkButton_click: function(e) {
          const li = e.target.parentElement
          const label = li.querySelector('.task')
          label.contentEditable = true
          label.focus()

          label.addEventListener('keypress', async function(event) {
              if (event.key === 'Enter') {
                  label.contentEditable = false
                  const taskId = li.dataset['id']
                  const updatedTask = { task: label.innerText.trim() }

                  try {
                      const response = await fetch(`${Main.apiUrl}/${taskId}`, {
                          method: 'PUT',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(updatedTask)
                      })

                      if (!response.ok) {
                          throw new Error('Erro ao atualizar a tarefa na API')
                      }
                  } catch (error) {
                      console.error('Erro ao atualizar a tarefa na API:', error)
                  }
              }
          })
      },

      inputTask_keypress: async function(e) {
          const key = e.key
          const value = e.target.value
          

          if (key === 'Enter' && value.trim() !== '') {
              const newTask = { task: value }

              try {
                  const response = await fetch(Main.apiUrl, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(newTask)
                  })

                  if (!response.ok) {
                      throw new Error('Erro ao adicionar a tarefa na API')
                  }

                  const createdTask = await response.json()
                  const taskHtml = Main.getTaskHtml(createdTask.task, createdTask._id)
                  Main.insertHTML(Main.$list, taskHtml)
              } catch (error) {
                  console.error('Erro ao adicionar a tarefa na API:', error)
              }

              e.target.value = ''
          }
      },

      removeButton_click: async function(e) {
          const li = e.target.parentElement
          const value = li.dataset['id']

          try {
              const response = await fetch(`${Main.apiUrl}/${value}`, {
                  method: 'DELETE'
              })

              if (!response.ok) {
                  throw new Error('Erro ao remover a tarefa na API')
              }

              li.classList.add('removed')
              setTimeout(() => li.classList.add('hidden'), 300)
          } catch (error) {
              console.error('Erro ao remover a tarefa na API:', error)
          }
      }
  }
}

Main.init()
