from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from mercado.models import MercadoItem
from online.models import ItemOnline
from usuario.models import UserProfile


def login_view(request):
    if request.user.is_authenticated:
        return redirect('core:dashboard')

    active_tab = 'login'
    error = None

    if request.method == 'POST':
        action = request.POST.get('action', 'login')
        active_tab = 'cadastro' if action == 'register' else 'login'

        if action == 'login':
            username = request.POST.get('username', '').strip()
            password = request.POST.get('password', '')
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                return redirect(request.GET.get('next', '/'))
            error = 'Usuário ou senha incorretos.'

        elif action == 'register':
            username = request.POST.get('username', '').strip()
            email    = request.POST.get('email', '').strip()
            password = request.POST.get('password', '')
            password2 = request.POST.get('password2', '')
            if not username:
                error = 'Informe um nome de usuário.'
            elif User.objects.filter(username=username).exists():
                error = 'Este nome de usuário já está em uso.'
            elif password != password2:
                error = 'As senhas não conferem.'
            elif len(password) < 6:
                error = 'A senha deve ter pelo menos 6 caracteres.'
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                login(request, user)
                return redirect('core:dashboard')

    return render(request, 'login.html', {'active_tab': active_tab, 'error': error})


def logout_view(request):
    logout(request)
    return redirect('core:login')


@login_required
def dashboard(request):
    profile = UserProfile.get_instance()
    mercado_total = MercadoItem.objects.count()
    online_total  = ItemOnline.objects.count()
    done_total    = (
        MercadoItem.objects.filter(checked=True).count()
        + ItemOnline.objects.filter(checked=True).count()
    )
    recentes = sorted(
        [*MercadoItem.objects.order_by('-created_at')[:6].values('nome', 'created_at'),
         *[{**i, 'cat': 'online'} for i in ItemOnline.objects.order_by('-created_at')[:6].values('nome', 'created_at')]],
        key=lambda x: x['created_at'], reverse=True
    )[:6]
    return render(request, 'index.html', {
        'active_page':    'dashboard',
        'profile':        profile,
        'mercado_total':  mercado_total,
        'online_total':   online_total,
        'done_total':     done_total,
        'recentes':       recentes,
    })


@login_required
def mercado_page(request):
    return render(request, 'mercado.html', {'active_page': 'mercado'})


@login_required
def online_page(request):
    return render(request, 'online.html', {'active_page': 'online'})


@login_required
def usuario_page(request):
    profile = UserProfile.get_instance()
    mercado_total = MercadoItem.objects.count()
    online_total  = ItemOnline.objects.count()
    done_total    = (
        MercadoItem.objects.filter(checked=True).count()
        + ItemOnline.objects.filter(checked=True).count()
    )
    return render(request, 'usuario.html', {
        'active_page':   'usuario',
        'profile':       profile,
        'mercado_total': mercado_total,
        'online_total':  online_total,
        'done_total':    done_total,
    })
