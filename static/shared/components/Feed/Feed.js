
module.exports = new Promise(async (resolve, reject) => {
  const vuex = await import("/weblibs/vuex/vuex.esm.browser.js");
  const { moment } = await import("/weblibs/moment/moment.min.js")
  const postService = await import("/services/postServices.js")

  resolve({
    name: "Feed",
    components: {
      comment: httpVueLoader("/weblibs/shared/components/Comment/index.vue")
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
    mounted() {
      if (this.post.id == 0) {
        this.displayComments()
      }
    },
    methods: {
      ...vuex.mapActions([
        "getComments"
      ]),
      displayComments () {
        console.log("displaying comments")
        this.showComments = !this.showComments;
        if(this.showComments){
          this.getComments(this.post.id)
        }
      }
    },
  })
})
