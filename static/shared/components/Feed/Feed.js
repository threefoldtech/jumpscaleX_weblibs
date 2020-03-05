
module.exports = new Promise(async (resolve, reject) => {
  const vuex = await import("/weblibs/vuex/vuex.esm.browser.js");
  const { moment } = await import("/weblibs/moment/moment.min.js")

  resolve({
    name: "Feed",
    components: {
    },
    props: ['post', 'loading'],
    data() {
      return{
        showComments: false
      }
    },
    computed: {
      formattedDate() {
        return moment(this.post.created).format('LLL')
      }
    },
    methods: {
      displayComments(){
        this.showComments = !this.showComments
        console.log(this.post)
        
      }
    },
  })
})
