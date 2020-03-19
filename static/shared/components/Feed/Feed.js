
module.exports = new Promise(async (resolve, reject) => {
  const vuex = await import("/weblibs/vuex/vuex.esm.browser.js");
  const { moment } = await import("/weblibs/moment/moment.min.js")

  resolve({
    name: "Feed",
    components: {
      comment: httpVueLoader("/weblibs/shared/components/Comment/index.vue")
    },
    props: ['post', 'loading'],
    data() {
      return{
        showComments: false,
        commentBody: null
      }
    },
    computed: {
      ...vuex.mapGetters([
        'user'
      ]),
      formattedDate() {
        return moment.unix(this.post.created).format('LLL')
      }
    },
    mounted() {
      // if (this.post.id == 0) {
      //   this.displayComments()
      // }
    },
    methods: {
      ...vuex.mapActions([
        "getComments",
        "addVote",
        "addComment"
      ]),
      displayComments () {
        console.log("displaying comments")
        this.showComments = !this.showComments;
        if(this.showComments){
          this.getComments(this.post.id)
        }
      },
      submitVote (vote) {
        console.log('this',this.post)
        this.addVote({
          post_id: this.post.id,
          vote: {
            type: vote,
            user: this.user.id
          }
        })
        console.log("voting ...", vote)
      },
      submitComment () {
        this.addComment({
          post_id: this.post.id,
          comment: {
            type: "comment",
            author: {
              name: "Dean Verjans",
              avatar: "https://api.adorable.io/avatars/1"
            },
            body: this.commentBody
          }
        })
        this.commentBody = ""
      }
    },
  })
})
