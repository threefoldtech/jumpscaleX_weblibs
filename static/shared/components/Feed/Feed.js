
module.exports = new Promise(async (resolve, reject) => {
  const vuex = await import("/weblibs/vuex/vuex.esm.browser.js");
  const { moment } = await import("/weblibs/moment/moment.min.js")
  const postService = await import("/services/postServices.js")

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
      displayComments () {
        console.log("displaying comments")
        this.showComments = !this.showComments;
        this.getComments()
      },
      getComments() {
        if (this.showComments) {
          postService.default.getComments(this.post.commentsCount).then(response => {
            this.$emit('update-comments', response.data.comments)
          }).catch(e => {
            console.log(e)
          })
        }
      }
    },
  })
})
